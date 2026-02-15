'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BonusReward } from '@/types/game';

interface BonusPopupProps {
  bonus: BonusReward | null;
}

export function BonusPopup({ bonus }: BonusPopupProps) {
  if (!bonus) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: -50 }}
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        <motion.div
          className={`px-8 py-6 rounded-2xl shadow-2xl ${
            bonus.type === 'crypto'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
              : bonus.type === 'multiplier'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-amber-500 to-yellow-500'
          }`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center text-white">
            {bonus.type === 'crypto' && (
              <>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-4xl mb-2"
                >
                  💎
                </motion.div>
                <div className="text-2xl font-bold">+{bonus.amount?.toFixed(4)} MED!</div>
                <div className="text-sm opacity-80 mt-1">Крипто-бонус!</div>
              </>
            )}
            {bonus.type === 'multiplier' && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.3, repeat: 3 }}
                  className="text-4xl mb-2"
                >
                  ⚡
                </motion.div>
                <div className="text-2xl font-bold">x{bonus.multiplier} МНОЖИТЕЛЬ!</div>
                <div className="text-sm opacity-80 mt-1">Очки умножены!</div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
