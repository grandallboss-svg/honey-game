import {
  Gem,
  GemType,
  Position,
  Match,
  SpecialType,
  GAME_CONFIG,
  BonusReward,
} from '@/types/game';

// Генерация уникального ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Получить случайный тип элемента
export const getRandomGemType = (): GemType => {
  const types: GemType[] = ['honey', 'flower', 'bee', 'comb', 'sun', 'water'];
  return types[Math.floor(Math.random() * types.length)];
};

// Создать новый элемент
export const createGem = (
  row: number,
  col: number,
  type?: GemType
): Gem => ({
  id: generateId(),
  type: type || getRandomGemType(),
  special: 'normal',
  position: { row, col },
  isMatched: false,
  isNew: true,
  isFalling: false,
});

// Создать пустое игровое поле
export const createEmptyBoard = (): (Gem | null)[][] => {
  return Array(GAME_CONFIG.BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(GAME_CONFIG.BOARD_WIDTH).fill(null));
};

// Создать начальное игровое поле без матчей
export const createInitialBoard = (): (Gem | null)[][] => {
  const board = createEmptyBoard();

  for (let row = 0; row < GAME_CONFIG.BOARD_HEIGHT; row++) {
    for (let col = 0; col < GAME_CONFIG.BOARD_WIDTH; col++) {
      let gem: Gem;
      let attempts = 0;

      do {
        gem = createGem(row, col);
        attempts++;
      } while (hasInitialMatch(board, gem) && attempts < 100);

      board[row][col] = gem;
    }
  }

  return board;
};

// Проверка на начальные матчи при генерации
const hasInitialMatch = (board: (Gem | null)[][], gem: Gem): boolean => {
  const { row, col } = gem.position;

  // Проверка по горизонтали
  if (col >= 2) {
    const left1 = board[row][col - 1];
    const left2 = board[row][col - 2];
    if (
      left1?.type === gem.type &&
      left2?.type === gem.type
    ) {
      return true;
    }
  }

  // Проверка по вертикали
  if (row >= 2) {
    const up1 = board[row - 1][col];
    const up2 = board[row - 2][col];
    if (
      up1?.type === gem.type &&
      up2?.type === gem.type
    ) {
      return true;
    }
  }

  return false;
};

// Найти все матчи на поле
export const findAllMatches = (board: (Gem | null)[][]): Match[] => {
  const matches: Match[] = [];
  const visited = new Set<string>();

  // Поиск по горизонтали
  for (let row = 0; row < GAME_CONFIG.BOARD_HEIGHT; row++) {
    for (let col = 0; col < GAME_CONFIG.BOARD_WIDTH - 2; col++) {
      const gem = board[row][col];
      if (!gem) continue;

      const positions: Position[] = [{ row, col }];

      for (let c = col + 1; c < GAME_CONFIG.BOARD_WIDTH; c++) {
        const next = board[row][c];
        if (next?.type === gem.type) {
          positions.push({ row, col: c });
        } else {
          break;
        }
      }

      if (positions.length >= GAME_CONFIG.MIN_MATCH) {
        const key = positions.map((p) => `${p.row},${p.col}`).join('|');
        if (!visited.has(key)) {
          visited.add(key);
          matches.push({
            positions,
            type: gem.type,
            length: positions.length,
            isCombo: false,
          });
        }
      }
    }
  }

  // Поиск по вертикали
  for (let col = 0; col < GAME_CONFIG.BOARD_WIDTH; col++) {
    for (let row = 0; row < GAME_CONFIG.BOARD_HEIGHT - 2; row++) {
      const gem = board[row][col];
      if (!gem) continue;

      const positions: Position[] = [{ row, col }];

      for (let r = row + 1; r < GAME_CONFIG.BOARD_HEIGHT; r++) {
        const next = board[r][col];
        if (next?.type === gem.type) {
          positions.push({ row: r, col });
        } else {
          break;
        }
      }

      if (positions.length >= GAME_CONFIG.MIN_MATCH) {
        const key = positions.map((p) => `${p.row},${p.col}`).join('|');
        if (!visited.has(key)) {
          visited.add(key);
          matches.push({
            positions,
            type: gem.type,
            length: positions.length,
            isCombo: false,
          });
        }
      }
    }
  }

  return matches;
};

// Проверить, возможен ли свап
export const isSwapValid = (
  board: (Gem | null)[][],
  from: Position,
  to: Position
): boolean => {
  // Проверка на соседние клетки
  const rowDiff = Math.abs(from.row - to.row);
  const colDiff = Math.abs(from.col - to.col);

  if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
    return false;
  }

  // Проверка на наличие элементов
  if (!board[from.row][from.col] || !board[to.row][to.col]) {
    return false;
  }

  // Проверка на создание матча после свапа
  const testBoard = board.map((row) => row.map((gem) => gem ? { ...gem } : null));

  // Свап
  const temp = testBoard[from.row][from.col];
  testBoard[from.row][from.col] = testBoard[to.row][to.col];
  testBoard[to.row][to.col] = temp;

  // Обновляем позиции
  if (testBoard[from.row][from.col]) {
    testBoard[from.row][from.col]!.position = from;
  }
  if (testBoard[to.row][to.col]) {
    testBoard[to.row][to.col]!.position = to;
  }

  const matches = findAllMatches(testBoard);
  return matches.length > 0;
};

// Выполнить свап
export const swapGems = (
  board: (Gem | null)[][],
  from: Position,
  to: Position
): (Gem | null)[][] => {
  const newBoard = board.map((row) => row.map((gem) => gem ? { ...gem } : null));

  const temp = newBoard[from.row][from.col];
  newBoard[from.row][from.col] = newBoard[to.row][to.col];
  newBoard[to.row][to.col] = temp;

  // Обновляем позиции
  if (newBoard[from.row][from.col]) {
    newBoard[from.row][from.col]!.position = from;
  }
  if (newBoard[to.row][to.col]) {
    newBoard[to.row][to.col]!.position = to;
  }

  return newBoard;
};

// Удалить совпавшие элементы
export const removeMatches = (
  board: (Gem | null)[][],
  matches: Match[]
): {
  board: (Gem | null)[][];
  specialGems: { position: Position; special: SpecialType }[];
  bonusRewards: BonusReward[];
} => {
  const newBoard = board.map((row) => row.map((gem) => gem ? { ...gem } : null));
  const specialGems: { position: Position; special: SpecialType }[] = [];
  const bonusRewards: BonusReward[] = [];

  for (const match of matches) {
    // Определяем специальные элементы
    if (match.length >= GAME_CONFIG.BOMB_MIN_MATCH) {
      const centerIdx = Math.floor(match.positions.length / 2);
      specialGems.push({
        position: match.positions[centerIdx],
        special: match.length >= GAME_CONFIG.LIGHTNING_MIN_MATCH ? 'lightning' : 'bomb',
      });
    }

    // Проверяем шанс бонуса
    if (Math.random() < GAME_CONFIG.CRYPTO_BONUS_CHANCE) {
      bonusRewards.push({
        type: 'crypto',
        amount: Math.random() * 0.01 + 0.001, // 0.001 - 0.011 MED
      });
    } else if (Math.random() < GAME_CONFIG.MULTIPLIER_BONUS_CHANCE) {
      bonusRewards.push({
        type: 'multiplier',
        multiplier: Math.floor(Math.random() * 3) + 2, // 2x - 4x
      });
    }

    // Удаляем элементы
    for (const pos of match.positions) {
      newBoard[pos.row][pos.col] = null;
    }
  }

  return { board: newBoard, specialGems, bonusRewards };
};

// Применить гравитацию - падение элементов
export const applyGravity = (board: (Gem | null)[][]): (Gem | null)[][] => {
  const newBoard = createEmptyBoard();

  for (let col = 0; col < GAME_CONFIG.BOARD_WIDTH; col++) {
    let writeRow = GAME_CONFIG.BOARD_HEIGHT - 1;

    // Сначала падают существующие элементы
    for (let row = GAME_CONFIG.BOARD_HEIGHT - 1; row >= 0; row--) {
      if (board[row][col]) {
        const gem = { ...board[row][col]! };
        gem.position = { row: writeRow, col };
        gem.isFalling = true;
        newBoard[writeRow][col] = gem;
        writeRow--;
      }
    }

    // Затем заполняем новыми элементами сверху
    while (writeRow >= 0) {
      newBoard[writeRow][col] = createGem(writeRow, col);
      writeRow--;
    }
  }

  return newBoard;
};

// Проверить, есть ли возможные ходы
export const hasValidMoves = (board: (Gem | null)[][]): boolean => {
  for (let row = 0; row < GAME_CONFIG.BOARD_HEIGHT; row++) {
    for (let col = 0; col < GAME_CONFIG.BOARD_WIDTH; col++) {
      // Проверка свапа вправо
      if (col < GAME_CONFIG.BOARD_WIDTH - 1) {
        if (isSwapValid(board, { row, col }, { row, col: col + 1 })) {
          return true;
        }
      }
      // Проверка свапа вниз
      if (row < GAME_CONFIG.BOARD_HEIGHT - 1) {
        if (isSwapValid(board, { row, col }, { row: row + 1, col })) {
          return true;
        }
      }
    }
  }
  return false;
};

// Вычислить очки за матч
export const calculateMatchScore = (match: Match, combo: number): number => {
  const baseScore = match.length * GAME_CONFIG.POINTS_PER_GEM;
  const comboBonus = combo * GAME_CONFIG.POINTS_PER_COMBO;
  const multiplier = 1 + combo * GAME_CONFIG.COMBO_MULTIPLIER;

  return Math.floor((baseScore + comboBonus) * multiplier);
};

// Вычислить нектар из очков
export const calculateNectar = (score: number): number => {
  return Math.floor(score / 100) * GAME_CONFIG.NECTAR_PER_100_POINTS;
};

// Получить уровень игрока по нектару
export const getPlayerLevel = (totalNectar: number): number => {
  const levels = [0, 1000, 5000, 15000, 50000, 100000, 250000, 500000];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalNectar >= levels[i]) {
      return i + 1;
    }
  }
  return 1;
};
