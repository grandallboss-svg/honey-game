'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { LEVELS, GAME_CONFIG, BonusReward } from '@/types/game';
import { Zap, Target } from 'lucide-react';

export function ScoreBoard() {
  const { score, nectar, moves, combo, maxCombo, bonusActive, player } = useGameStore();

  const currentLevel = LEVELS.find(
    (l, i) => 
      (LEVELS[i + 1]?.requiredNectar ?? Infinity) > (player?.totalNectar || 0)
  ) || LEVELS[0];

  return (
    <div className="w-full bg-amber-900/40 rounded-xl p-2 border border-amber-600/20 backdrop-blur-sm">
      {/* Основная строка */}
      <div className="flex items-center justify-between gap-2">
        {/* Очки */}
        <div className="flex items-center gap-1.5">
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            className="text-lg"
          >
            🏆
          </motion.span>
          <div>
            <motion.div
              key={score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-lg font-bold text-white leading-tight"
            >
              {score.toLocaleString()}
            </motion.div>
            <div className="text-[10px] text-amber-300/70 leading-tight">
              {currentLevel.name}
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="w-px h-8 bg-amber-600/30" />

        {/* Нектар */}
        <div className="flex items-center gap-1.5">
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-lg"
          >
            🍯
          </motion.span>
          <div>
            <motion.div
              key={nectar}
              initial={{ scale: 1.1, color: '#fcd34d' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-lg font-bold text-white leading-tight"
            >
              {nectar.toLocaleString()}
            </motion.div>
            <div className="text-[10px] text-amber-300/70 leading-tight">
              {GAME_CONFIG.NECTAR_TO_MED.toLocaleString()} = 1 MED
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="w-px h-8 bg-amber-600/30" />

        {/* Ходы */}
        <div className="flex items-center gap-1.5">
          {moves <= 5 ? (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="text-lg"
            >
              ⚠️
            </motion.span>
          ) : (
            <Zap className="w-4 h-4 text-amber-400" />
          )}
          <div>
            <motion.div
              key={moves}
              animate={moves <= 5 ? { 
                color: ['#ef4444', '#fbbf24', '#ef4444'] 
              } : {}}
              transition={{ duration: 0.5, repeat: moves <= 5 ? Infinity : 0 }}
              className={`text-lg font-bold leading-tight ${
                moves <= 5 ? 'text-red-400' : 'text-white'
              }`}
            >
              {moves}
            </motion.div>
            <div className="text-[10px] text-amber-300/70 leading-tight">
              {moves <= 5 ? 'Внимание!' : 'Ходов'}
            </div>
          </div>
        </div>
      </div>

      {/* Комбо индикатор (показывается при комбо > 1) */}
      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <div className="bg-gradient-to-r from-orange-500/80 to-red-500/80 rounded-lg p-1.5 text-center flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-base"
              >
                🔥
              </motion.span>
              <span className="text-white font-bold text-sm">
                КОМБО x{combo}!
              </span>
              <span className="text-yellow-200 text-xs">
                +{combo * 50}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Бонус индикатор */}
      <AnimatePresence>
        {bonusActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-2"
          >
            <BonusIndicator bonus={bonusActive} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BonusIndicator({ bonus }: { bonus: BonusReward }) {
  return (
    <motion.div
      className={`rounded-lg p-1.5 text-center text-sm flex items-center justify-center gap-1.5 ${
        bonus.type === 'crypto' 
          ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80' 
          : bonus.type === 'gold'
          ? 'bg-gradient-to-r from-yellow-500/80 to-amber-500/80'
          : 'bg-gradient-to-r from-green-500/80 to-emerald-500/80'
      }`}
    >
      {bonus.type === 'crypto' && (
        <>
          <span>💎</span>
          <span className="text-white font-bold">
            +{bonus.amount?.toFixed(4)} MED!
          </span>
        </>
      )}
      {bonus.type === 'gold' && (
        <>
          <span>💰</span>
          <span className="text-white font-bold">
            +{bonus.goldAmount} золота!
          </span>
        </>
      )}
      {bonus.type === 'multiplier' && (
        <>
          <Zap className="w-4 h-4 text-white" />
          <span className="text-white font-bold">
            x{bonus.multiplier} множитель!
          </span>
        </>
      )}
      {bonus.type === 'weapon' && (
        <>
          <span>⚔️</span>
          <span className="text-white font-bold">
            Оружие получено!
          </span>
        </>
      )}
    </motion.div>
  );
}
