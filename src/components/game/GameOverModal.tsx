'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { LEVELS } from '@/types/game';
import { Trophy, Coins, Zap, Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameOverModalProps {
  isOpen: boolean;
  onRestart: () => void;
}

export function GameOverModal({ isOpen, onRestart }: GameOverModalProps) {
  const { score, nectar, maxCombo, player, totalBonusEarned } = useGameStore();

  const currentLevel = LEVELS.find(
    (l, i) => 
      (LEVELS[i + 1]?.requiredNectar ?? Infinity) > (player?.totalNectar || 0)
  ) || LEVELS[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-amber-600/30 text-center"
        >
          {/* Заголовок */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Игра окончена!
            </h2>
            <p className="text-amber-300">
              Отличная работа, {player?.firstName || 'Пчела'}!
            </p>
          </motion.div>

          {/* Статистика */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-amber-950/50 rounded-xl p-4 border border-amber-600/20"
            >
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-amber-300 text-sm">Очки</div>
              <div className="text-2xl font-bold text-white">
                {score.toLocaleString()}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-amber-950/50 rounded-xl p-4 border border-amber-600/20"
            >
              <span className="text-3xl block mb-1">🍯</span>
              <div className="text-amber-300 text-sm">Нектар</div>
              <div className="text-2xl font-bold text-white">
                +{nectar.toLocaleString()}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-amber-950/50 rounded-xl p-4 border border-amber-600/20"
            >
              <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-amber-300 text-sm">Макс. комбо</div>
              <div className="text-2xl font-bold text-white">
                x{maxCombo}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-amber-950/50 rounded-xl p-4 border border-amber-600/20"
            >
              <Coins className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-amber-300 text-sm">MED бонус</div>
              <div className="text-2xl font-bold text-white">
                +{totalBonusEarned.toFixed(4)}
              </div>
            </motion.div>
          </div>

          {/* Уровень */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-amber-600/30 to-amber-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Ваш уровень</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {currentLevel.level} - {currentLevel.name}
            </div>
          </motion.div>

          {/* Кнопки */}
          <div className="space-y-3">
            <Button
              onClick={onRestart}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-900 font-bold py-6 text-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Играть снова
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
