'use client';

import { create } from 'zustand';
import {
  Gem,
  GameState,
  Player,
  Position,
  Match,
  BonusReward,
  Weapon,
  InventoryItem,
  WeaponEffect,
  GAME_CONFIG,
  WEAPONS,
} from '@/types/game';
import {
  createInitialBoard,
  findAllMatches,
  isSwapValid,
  swapGems,
  applyGravity,
  calculateMatchScore,
  calculateNectar,
  hasValidMoves,
  createGem,
  generateId,
} from '@/lib/game/engine';
import { soundManager } from '@/lib/game/sounds';

// Telegram WebApp типы
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        HapticFeedback: {
          impactOccurred: (style: string) => void;
          notificationOccurred: (type: string) => void;
        };
      };
    };
  }
}

interface GameStore extends GameState {
  player: Player | null;
  selectedGem: Position | null;
  totalBonusEarned: number;
  inventory: InventoryItem[];
  
  // Actions
  initGame: (player: Player) => void;
  selectGem: (position: Position) => void;
  makeSwap: (from: Position, to: Position) => Promise<boolean>;
  processMatches: () => Promise<void>;
  resetGame: () => void;
  addBonus: (amount: number) => void;
  exchangeNectar: () => void;
  updatePlayer: (player: Partial<Player>) => void;
  
  // Оружие
  selectWeapon: (weapon: Weapon | null) => void;
  toggleWeaponMode: () => void;
  useWeapon: (position: Position) => Promise<void>;
  addToInventory: (weapon: Weapon, quantity?: number) => void;
  removeFromInventory: (weaponId: string) => void;
  clearWeaponEffect: () => void;
  
  // Золото
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
}

const initialState: GameState = {
  board: [],
  score: 0,
  nectar: 0,
  moves: GAME_CONFIG.INITIAL_MOVES,
  level: 1,
  combo: 0,
  maxCombo: 0,
  isAnimating: false,
  gameOver: false,
  bonusActive: null,
  sessionStartTime: Date.now(),
  selectedWeapon: null,
  weaponMode: false,
  weaponEffect: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  player: null,
  selectedGem: null,
  totalBonusEarned: 0,
  inventory: [],

  initGame: (player: Player) => {
    const board = createInitialBoard();
    set({
      ...initialState,
      board,
      player,
      level: player.level,
      sessionStartTime: Date.now(),
      inventory: player.inventory || [],
    });
  },

  selectGem: (position: Position) => {
    const { selectedGem, board, isAnimating, moves, weaponMode, selectedWeapon } = get();
    
    if (isAnimating || moves <= 0) return;

    // Режим оружия
    if (weaponMode && selectedWeapon) {
      get().useWeapon(position);
      return;
    }

    // Если нет выбранного элемента - выбираем текущий
    if (!selectedGem) {
      set({ selectedGem: position });
      soundManager.playSelect();
      return;
    }

    // Если кликнули на тот же элемент - снимаем выделение
    if (selectedGem.row === position.row && selectedGem.col === position.col) {
      set({ selectedGem: null });
      return;
    }

    // Проверяем валидность свапа
    if (isSwapValid(board, selectedGem, position)) {
      soundManager.playSwap();
      get().makeSwap(selectedGem, position);
    } else {
      // Если свап невалиден - выбираем новый элемент
      soundManager.playSelect();
      set({ selectedGem: position });
    }
  },

  makeSwap: async (from: Position, to: Position): Promise<boolean> => {
    const { board, isAnimating } = get();
    
    if (isAnimating) return false;

    set({ isAnimating: true, selectedGem: null });

    // Выполняем свап - ячейки начнут анимацию перемещения
    const newBoard = swapGems(board, from, to);
    set({ board: newBoard });

    // Ждём анимации свапа (0.35 сек)
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Проверяем есть ли матчи, которые включают свапнутые элементы
    const allMatches = findAllMatches(newBoard);
    
    // Фильтруем - матч должен включать хотя бы одну из свапнутых позиций
    const matches = allMatches.filter(match => 
      match.positions.some(p => 
        (p.row === from.row && p.col === from.col) ||
        (p.row === to.row && p.col === to.col)
      )
    );
    
    if (matches.length === 0) {
      // Матчей нет - показываем ошибку и возвращаем элементы обратно
      
      // Вибрация в Telegram (двойная)
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      }
      
      // Звук ошибки "beep beep"
      soundManager.playError();
      
      // Вторая вибрация для "beep beep"
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        }
      }, 150);
      
      // Пауза чтобы игрок увидел что свап произошёл (ячейки на новых местах)
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      // Возвращаем элементы обратно - tween анимация вернёт их плавно
      const restoredBoard = swapGems(newBoard, from, to);
      set({ board: restoredBoard });
      
      // Ждём анимации возврата (0.35 сек)
      await new Promise((resolve) => setTimeout(resolve, 350));
      set({ isAnimating: false });
      return false;
    }

    // Матчи есть - тратим ход
    set({ moves: get().moves - 1 });

    // Обрабатываем все матчи на поле (не только от свапа)
    await get().processMatches();

    return true;
  },

  processMatches: async () => {
    let { board, score, nectar, combo, maxCombo, player } = get();
    
    let matches = findAllMatches(board);
    
    while (matches.length > 0) {
      // === ШАГ 1: Помечаем ячейки для уничтожения ===
      const matchedBoard = board.map((row) =>
        row.map((gem) => {
          if (!gem) return null;
          const isMatched = matches.some((m) =>
            m.positions.some((p) => p.row === gem.position.row && p.col === gem.position.col)
          );
          return isMatched ? { ...gem, isMatched: true } : gem;
        })
      );
      
      set({ board: matchedBoard, combo: combo + 1 });
      combo++;
      maxCombo = Math.max(maxCombo, combo);

      // === ШАГ 2: Ждём анимации взрыва (0.5 сек) - достаточно для визуального эффекта
      await new Promise((resolve) => setTimeout(resolve, 500));

      // === ШАГ 3: Вычисляем очки и бонусы ===
      let roundScore = 0;
      for (const match of matches) {
        roundScore += calculateMatchScore(match, combo);
      }
      
      // Применяем множитель бонуса если активен
      const { bonusActive } = get();
      if (bonusActive?.type === 'multiplier' && bonusActive.multiplier) {
        roundScore *= bonusActive.multiplier;
      }

      score += roundScore;
      nectar += calculateNectar(roundScore);

      // Генерируем бонусы
      const bonusRewards: BonusReward[] = [];
      if (Math.random() < GAME_CONFIG.CRYPTO_BONUS_CHANCE) {
        bonusRewards.push({
          type: 'crypto',
          amount: Math.random() * 0.01 + 0.001,
        });
      } else if (Math.random() < GAME_CONFIG.GOLD_BONUS_CHANCE) {
        bonusRewards.push({
          type: 'gold',
          goldAmount: Math.floor(Math.random() * 50) + 10,
        });
      } else if (Math.random() < GAME_CONFIG.WEAPON_BONUS_CHANCE) {
        const weapon = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
        bonusRewards.push({
          type: 'weapon',
          weaponType: weapon.type,
        });
      }

      // Обрабатываем бонусы
      for (const bonus of bonusRewards) {
        if (bonus.type === 'crypto' && bonus.amount) {
          set((state) => ({ 
            totalBonusEarned: state.totalBonusEarned + bonus.amount! 
          }));
        } else if (bonus.type === 'gold' && bonus.goldAmount) {
          set((state) => ({
            player: state.player ? {
              ...state.player,
              gold: state.player.gold + bonus.goldAmount!,
            } : null,
          }));
        } else if (bonus.type === 'weapon' && bonus.weaponType) {
          const weapon = WEAPONS.find(w => w.type === bonus.weaponType);
          if (weapon) {
            get().addToInventory(weapon, 1);
          }
        }
      }

      set({ 
        score, 
        nectar, 
        combo, 
        maxCombo,
        bonusActive: bonusRewards[0] || null,
      });

      // === ШАГ 4: Удаляем уничтоженные ячейки ===
      const clearedBoard = matchedBoard.map((row) =>
        row.map((gem) => (gem?.isMatched ? null : gem))
      );

      // === ШАГ 5: Применяем гравитацию ===
      const fallenBoard = applyGravity(clearedBoard);
      set({ board: fallenBoard });

      // Ждём анимации падения (0.4 сек)
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Убираем флаги анимации
      const finalBoard = fallenBoard.map((row) =>
        row.map((gem) => (gem ? { ...gem, isNew: false, isFalling: false } : null))
      );
      set({ board: finalBoard });

      // === ШАГ 6: Проверяем новые матчи ===
      board = finalBoard;
      matches = findAllMatches(board);
    }

    // Сбрасываем комбо и бонус быстро
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ combo: 0, bonusActive: null });

    // Проверяем на конец игры
    const currentMoves = get().moves;
    if (currentMoves <= 0 || !hasValidMoves(board)) {
      set({ gameOver: true, isAnimating: false });
    } else {
      set({ isAnimating: false });
    }

    // Обновляем игрока
    const currentPlayer = get().player;
    if (currentPlayer) {
      get().updatePlayer({
        nectar: currentPlayer.nectar + nectar,
        totalNectar: currentPlayer.totalNectar + nectar,
        maxCombo: Math.max(currentPlayer.maxCombo, maxCombo),
        totalScore: currentPlayer.totalScore + score,
      });
    }
  },

  resetGame: () => {
    const board = createInitialBoard();
    set({
      ...initialState,
      board,
      sessionStartTime: Date.now(),
    });
  },

  addBonus: (amount: number) => {
    set((state) => ({ 
      totalBonusEarned: state.totalBonusEarned + amount 
    }));
  },

  exchangeNectar: () => {
    const { player, nectar } = get();
    if (!player || nectar < GAME_CONFIG.NECTAR_TO_MED) return;

    const medAmount = Math.floor(nectar / GAME_CONFIG.NECTAR_TO_MED);
    const nectarSpent = medAmount * GAME_CONFIG.NECTAR_TO_MED;

    set((state) => ({
      nectar: state.nectar - nectarSpent,
      player: player ? {
        ...player,
        nectar: player.nectar - nectarSpent,
        totalNectar: player.totalNectar,
        medBalance: player.medBalance + medAmount,
        totalWithdrawn: player.totalWithdrawn + medAmount,
      } : null,
    }));
  },

  updatePlayer: (playerData: Partial<Player>) => {
    set((state) => ({
      player: state.player ? { ...state.player, ...playerData } : null,
    }));
  },

  // Оружие
  selectWeapon: (weapon: Weapon | null) => {
    set({ 
      selectedWeapon: weapon, 
      weaponMode: weapon !== null,
      selectedGem: null,
    });
  },

  toggleWeaponMode: () => {
    set((state) => ({ 
      weaponMode: !state.weaponMode,
      selectedWeapon: state.weaponMode ? null : state.selectedWeapon,
    }));
  },

  useWeapon: async (position: Position) => {
    const { board, selectedWeapon, isAnimating, moves, inventory, player } = get();

    if (!selectedWeapon || isAnimating) return;

    // Проверяем наличие оружия в инвентаре
    const invItem = inventory.find(i => i.weaponId === selectedWeapon.id);
    if (!invItem || invItem.quantity <= 0) return;

    set({ isAnimating: true, weaponMode: false, selectedWeapon: null });

    // Уменьшаем количество в инвентаре
    get().removeFromInventory(selectedWeapon.id);

    // === УСТАНАВЛИВАЕМ ВИЗУАЛЬНЫЙ ЭФФЕКТ ПЕРЕД ТЕМ КАК ПОМЕЧАТЬ ЯЧЕЙКИ ===
    set({
      weaponEffect: {
        type: selectedWeapon.type,
        position,
      }
    });

    // === ВОСПРОИЗВОДИМ ЗВУК ОРУЖИЯ ===
    soundManager.playWeapon(selectedWeapon.type);

    // === ЖДЁМ ПОКА ЭФФЕКТ ОТОБРАЗИТСЯ (0.6 сек) ===
    await new Promise((resolve) => setTimeout(resolve, 600));

    // === ШАГ 1: Помечаем ячейки для уничтожения ===
    const markedBoard = board.map(row => row.map(gem => gem ? { ...gem } : null));

    switch (selectedWeapon.type) {
      case 'lightning':
        // Уничтожаем всю строку и колонку
        for (let col = 0; col < GAME_CONFIG.BOARD_WIDTH; col++) {
          if (markedBoard[position.row][col]) {
            markedBoard[position.row][col]!.isMatched = true;
          }
        }
        for (let row = 0; row < GAME_CONFIG.BOARD_HEIGHT; row++) {
          if (markedBoard[row][position.col]) {
            markedBoard[row][position.col]!.isMatched = true;
          }
        }
        break;

      case 'dynamite':
        // Взрыв 3x3
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const r = position.row + dr;
            const c = position.col + dc;
            if (r >= 0 && r < GAME_CONFIG.BOARD_HEIGHT && c >= 0 && c < GAME_CONFIG.BOARD_WIDTH) {
              if (markedBoard[r][c]) {
                markedBoard[r][c]!.isMatched = true;
              }
            }
          }
        }
        break;

      case 'honeyblast':
        // Уничтожаем все ячейки определённого типа
        const targetType = board[position.row][position.col]?.type;
        if (targetType) {
          for (let r = 0; r < GAME_CONFIG.BOARD_HEIGHT; r++) {
            for (let c = 0; c < GAME_CONFIG.BOARD_WIDTH; c++) {
              if (markedBoard[r][c]?.type === targetType) {
                markedBoard[r][c]!.isMatched = true;
              }
            }
          }
        }
        break;

      case 'beeswarm':
        // Случайное уничтожение 12 ячеек
        const allPositions: Position[] = [];
        for (let r = 0; r < GAME_CONFIG.BOARD_HEIGHT; r++) {
          for (let c = 0; c < GAME_CONFIG.BOARD_WIDTH; c++) {
            if (markedBoard[r][c] && !markedBoard[r][c]!.isMatched) {
              allPositions.push({ row: r, col: c });
            }
          }
        }
        // Перемешиваем и берём первые 12
        for (let i = allPositions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
        }
        allPositions.slice(0, 12).forEach(pos => {
          if (markedBoard[pos.row][pos.col]) {
            markedBoard[pos.row][pos.col]!.isMatched = true;
          }
        });
        break;
    }

    set({ board: markedBoard });

    // === ШАГ 2: Ждём анимации взрыва (0.6 сек) ===
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Добавляем очки
    const destroyedCount = markedBoard.flat().filter(g => g?.isMatched).length;
    const weaponScore = destroyedCount * GAME_CONFIG.POINTS_PER_GEM * 2;

    set((state) => ({
      score: state.score + weaponScore,
      nectar: state.nectar + calculateNectar(weaponScore),
    }));

    // === ШАГ 3: Удаляем уничтоженные ячейки ===
    const clearedBoard = markedBoard.map(row =>
      row.map(gem => gem?.isMatched ? null : gem)
    );

    // === ШАГ 4: Применяем гравитацию ===
    const fallenBoard = applyGravity(clearedBoard);
    set({ board: fallenBoard, weaponEffect: null });

    // Ждём анимации падения (0.4 сек)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const finalBoard = fallenBoard.map(row =>
      row.map(gem => gem ? { ...gem, isNew: false, isFalling: false } : null)
    );
    set({ board: finalBoard, isAnimating: false });

    // Обрабатываем возможные матчи после использования оружия
    await get().processMatches();
  },

  clearWeaponEffect: () => {
    set({ weaponEffect: null });
  },

  addToInventory: (weapon: Weapon, quantity = 1) => {
    set((state) => {
      const existing = state.inventory.find(i => i.weaponId === weapon.id);
      if (existing) {
        return {
          inventory: state.inventory.map(i =>
            i.weaponId === weapon.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        };
      }
      return {
        inventory: [...state.inventory, {
          id: generateId(),
          weaponId: weapon.id,
          weapon,
          quantity,
        }],
      };
    });
  },

  removeFromInventory: (weaponId: string) => {
    set((state) => ({
      inventory: state.inventory
        .map(i => i.weaponId === weaponId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0),
    }));
  },

  // Золото
  addGold: (amount: number) => {
    set((state) => ({
      player: state.player ? { ...state.player, gold: state.player.gold + amount } : null,
    }));
  },

  spendGold: (amount: number) => {
    const { player } = get();
    if (!player || player.gold < amount) return false;
    
    set((state) => ({
      player: state.player ? { ...state.player, gold: state.player.gold - amount } : null,
    }));
    return true;
  },
}));
