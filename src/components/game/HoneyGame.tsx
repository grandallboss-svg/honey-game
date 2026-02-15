'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Player, GAME_CONFIG, WEAPONS } from '@/types/game';
import { GameBoard } from './GameBoard';
import { ScoreBoard } from './ScoreBoard';
import { ExchangeModal } from './ExchangeModal';
import { GameOverModal } from './GameOverModal';
import { Tutorial } from './Tutorial';
import { BonusPopup } from './BonusPopup';
import { MobileMenu } from './MobileMenu';
import { Menu, Zap } from 'lucide-react';
import { soundManager } from '@/lib/game/sounds';

// Telegram WebApp типы
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: string) => void;
          notificationOccurred: (type: string) => void;
        };
      };
    };
  }
}

export function HoneyGame() {
  const { 
    initGame, 
    resetGame, 
    gameOver, 
    player, 
    nectar,
    updatePlayer,
    bonusActive,
    inventory,
    selectedWeapon,
    selectWeapon,
    weaponMode,
    combo,
  } = useGameStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExchange, setShowExchange] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Инициализация Telegram WebApp
  useEffect(() => {
    const initTelegram = async () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand();

          const tgUser = tg.initDataUnsafe?.user;
          
          if (tgUser) {
            const response = await fetch('/api/player', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: tgUser.id.toString(),
                username: tgUser.username,
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                photoUrl: tgUser.photo_url,
              }),
            });

            if (response.ok) {
              const { player: dbPlayer } = await response.json();
              // Добавляем стартовый инвентарь если его нет или пустой
              const playerWithInventory = {
                ...dbPlayer,
                inventory: (dbPlayer.inventory && dbPlayer.inventory.length > 0) 
                  ? dbPlayer.inventory 
                  : [
                      { id: '1', weaponId: 'lightning', weapon: WEAPONS[0], quantity: 1 },
                      { id: '2', weaponId: 'dynamite', weapon: WEAPONS[1], quantity: 1 },
                      { id: '3', weaponId: 'honeyblast', weapon: WEAPONS[2], quantity: 1 },
                    ],
              };
              initGame(playerWithInventory as Player);
            } else {
              initLocalPlayer(tgUser);
            }
          } else {
            initDemoPlayer();
          }
        } else {
          initDemoPlayer();
        }
      } catch (err) {
        console.error('Init error:', err);
        setError('Ошибка инициализации');
      } finally {
        setIsLoading(false);
      }
    };

    const initLocalPlayer = (tgUser: any) => {
      initGame({
        id: 'local',
        telegramId: tgUser.id.toString(),
        username: tgUser.username || null,
        firstName: tgUser.first_name || null,
        lastName: tgUser.last_name || null,
        photoUrl: tgUser.photo_url || null,
        nectar: 0,
        totalNectar: 0,
        level: 1,
        medBalance: 0,
        totalWithdrawn: 0,
        gold: 100,
        gamesPlayed: 0,
        matchesMade: 0,
        combosHit: 0,
        maxCombo: 0,
        bonusesCollected: 0,
        totalScore: 0,
        inventory: [
          { id: '1', weaponId: 'lightning', weapon: WEAPONS[0], quantity: 1 },
          { id: '2', weaponId: 'dynamite', weapon: WEAPONS[1], quantity: 1 },
          { id: '3', weaponId: 'honeyblast', weapon: WEAPONS[2], quantity: 1 },
        ],
      });
    };

    const initDemoPlayer = () => {
      initGame({
        id: 'demo',
        telegramId: 'demo',
        username: 'DemoPlayer',
        firstName: 'Демо',
        lastName: 'Пчела',
        photoUrl: null,
        nectar: 5000,
        totalNectar: 5000,
        level: 1,
        medBalance: 0.005,
        totalWithdrawn: 0,
        gold: 1000,
        gamesPlayed: 15,
        matchesMade: 450,
        combosHit: 32,
        maxCombo: 5,
        bonusesCollected: 8,
        totalScore: 125000,
        inventory: [
          { id: '1', weaponId: 'lightning', weapon: WEAPONS[0], quantity: 1 },
          { id: '2', weaponId: 'dynamite', weapon: WEAPONS[1], quantity: 1 },
          { id: '3', weaponId: 'honeyblast', weapon: WEAPONS[2], quantity: 1 },
        ],
      });
    };

    initTelegram();
    
    // Показываем инструкцию при каждом старте, если пользователь не отключил
    const hasDisabledTutorial = localStorage.getItem('honey_tutorial_disabled');
    if (!hasDisabledTutorial) {
      setShowTutorial(true);
    }
  }, [initGame]);

  // Обработка закрытия туториала
  const handleTutorialClose = (dontShowAgain?: boolean) => {
    setShowTutorial(false);
    if (dontShowAgain) {
      localStorage.setItem('honey_tutorial_disabled', 'true');
    }
  };

  // Сохранение прогресса
  const saveProgress = useCallback(async () => {
    if (!player || player.id === 'demo' || player.id === 'local') return;
    
    setSaveStatus('saving');
    try {
      await fetch('/api/player', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: player.telegramId,
          nectar: player.nectar,
          totalNectar: player.totalNectar,
          level: player.level,
          medBalance: player.medBalance,
        }),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Save error:', err);
    }
  }, [player]);

  // Автосохранение
  useEffect(() => {
    const timer = setTimeout(() => {
      if (player && nectar > 0) {
        saveProgress();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [nectar, saveProgress, player]);

  // Game Over
  useEffect(() => {
    if (gameOver) {
      if (player && player.id !== 'demo' && player.id !== 'local') {
        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: player.id,
            score: useGameStore.getState().score,
            moves: GAME_CONFIG.INITIAL_MOVES - useGameStore.getState().moves,
            nectarEarned: nectar,
          }),
        });
      }
      
      soundManager.playGameOver(useGameStore.getState().score > 5000);
      setShowGameOver(true);
    }
  }, [gameOver, player, nectar]);

  const handleRestart = () => {
    resetGame();
    setShowGameOver(false);
    soundManager.playClick();
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setSoundEnabled(!muted);
  };

  // Быстрый доступ к оружию
  const quickWeapons = inventory.slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-3"
          >
            🐝
          </motion.div>
          <h1 className="text-2xl font-bold text-amber-200 mb-1">Honey</h1>
          <p className="text-amber-400/70 text-sm">Загрузка...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-3">😕</div>
          <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
          <button 
            onClick={() => window.location.reload()}
            className="bg-amber-600 text-amber-100 px-4 py-2 rounded-xl font-medium"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900 flex flex-col">
      {/* Декоративный фон */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 text-5xl opacity-5"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🍯
        </motion.div>
        <motion.div
          className="absolute top-20 right-10 text-4xl opacity-5"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          🌸
        </motion.div>
      </div>

      {/* Компактная шапка */}
      <div className="relative z-10 p-2">
        <div className="flex items-center justify-between bg-stone-900/70 rounded-xl px-3 py-2 backdrop-blur-sm border border-amber-700/30">
          {/* Левая часть - меню и игрок */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowMobileMenu(true);
                soundManager.playClick();
              }}
              className="w-9 h-9 flex items-center justify-center bg-amber-800/50 rounded-lg text-amber-100 active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Имя игрока и аватар */}
            <div className="flex items-center gap-2">
              {player?.photoUrl ? (
                <img 
                  src={player.photoUrl} 
                  alt="" 
                  className="w-8 h-8 rounded-full border border-amber-400/30 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-lg">
                  🐝
                </div>
              )}
              <div className="hidden sm:block">
                <div className="text-white text-sm font-medium leading-tight">
                  {player?.username || player?.firstName || 'Пчела'}
                </div>
                <div className="text-amber-300/70 text-xs">
                  Ур. {player?.level || 1}
                </div>
              </div>
            </div>
          </div>

          {/* Центр - балансы */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-amber-950/40 rounded-full px-2 py-1">
              <span>🍯</span>
              <span className="text-white font-medium">{player?.nectar.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-1 bg-amber-950/40 rounded-full px-2 py-1">
              <span>💰</span>
              <span className="text-yellow-300 font-medium">{player?.gold || 0}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-amber-950/40 rounded-full px-2 py-1">
              <span>💎</span>
              <span className="text-purple-300 font-medium">{(player?.medBalance || 0).toFixed(3)}</span>
            </div>
          </div>

          {/* Правая часть - комбо индикатор */}
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-2 py-1"
            >
              <span className="text-sm">🔥</span>
              <span className="text-white text-xs font-bold">x{combo}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Табло очков (компактное) */}
      <div className="relative z-10 px-2 pb-1">
        <ScoreBoard />
      </div>

      {/* Быстрый доступ к оружию - более заметная панель */}
      {quickWeapons.length > 0 && (
        <div className="relative z-10 px-2 pb-2">
          <div className="flex items-center gap-2 bg-stone-800/60 rounded-xl p-2 border border-amber-600/30">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-xs font-medium">Оружие:</span>
            <div className="flex gap-2 ml-1">
              {quickWeapons.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => selectWeapon(
                    selectedWeapon?.id === item.weaponId ? null : item.weapon
                  )}
                  className={`relative p-2 rounded-xl transition-all border-2 ${
                    selectedWeapon?.id === item.weaponId
                      ? 'bg-amber-500 border-white shadow-lg shadow-amber-500/50'
                      : 'bg-stone-700/80 border-amber-600/50 active:bg-stone-600/80'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-2xl">{item.weapon.icon}</span>
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md border border-white/30">
                    {item.quantity}
                  </span>
                </motion.button>
              ))}
            </div>
            
            {weaponMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 bg-red-500/30 text-red-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-400/30"
              >
                <span>🎯 Выберите цель</span>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Игровое поле */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-2 py-1">
        <GameBoard />
      </div>

      {/* Статус сохранения */}
      <AnimatePresence>
        {saveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-center pb-1 text-sm ${
              saveStatus === 'saving' ? 'text-amber-300' : 'text-green-400'
            }`}
          >
            {saveStatus === 'saving' ? '💾 Сохранение...' : '✓ Сохранено'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Мобильное меню */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onOpenProfile={() => {}}
        onOpenExchange={() => setShowExchange(true)}
        onOpenTutorial={() => setShowTutorial(true)}
        onRestart={handleRestart}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />

      {/* Модальные окна */}
      <ExchangeModal
        isOpen={showExchange}
        onClose={() => setShowExchange(false)}
      />
      <GameOverModal
        isOpen={showGameOver}
        onRestart={handleRestart}
      />
      <Tutorial
        isOpen={showTutorial}
        onClose={handleTutorialClose}
      />
      
      {/* Всплывающие бонусы */}
      <BonusPopup bonus={bonusActive} />
    </div>
  );
}
