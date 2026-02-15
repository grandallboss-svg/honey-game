'use client';

import { Gem as GemType, GEM_COLORS, GEM_EMOJIS } from '@/types/game';
import { motion } from 'framer-motion';

interface GemProps {
  gem: GemType;
  isSelected: boolean;
  onClick: () => void;
  cellSize: number;
}

export function Gem({ gem, isSelected, onClick, cellSize }: GemProps) {
  const bgColor = GEM_COLORS[gem.type];
  const emoji = GEM_EMOJIS[gem.type];

  return (
    <motion.div
      className={`absolute cursor-pointer rounded-xl flex items-center justify-center select-none
        ${isSelected ? 'ring-4 ring-white ring-opacity-80 z-10' : ''}
        ${gem.isMatched ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
      `}
      style={{
        width: cellSize - 4,
        height: cellSize - 4,
        background: `radial-gradient(circle at 30% 30%, ${bgColor}, ${bgColor}dd)`,
        boxShadow: `
          0 4px 6px ${bgColor}66,
          inset 0 2px 4px rgba(255, 255, 255, 0.4),
          inset 0 -2px 4px rgba(0, 0, 0, 0.2)
        `,
        left: gem.position.col * cellSize + 2,
        top: gem.position.row * cellSize + 2,
      }}
      initial={gem.isNew ? { scale: 0, opacity: 0, y: -cellSize } : false}
      animate={{
        scale: gem.isMatched ? 0 : 1,
        opacity: gem.isMatched ? 0 : 1,
        y: gem.isFalling ? [null, gem.position.row * cellSize] : 0,
      }}
      transition={{
        duration: gem.isFalling ? 0.3 : 0.2,
        ease: gem.isFalling ? 'easeOut' : 'easeInOut',
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1, zIndex: 20 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Бонусный индикатор */}
      {gem.bonusReward && (
        <motion.div
          className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          💎
        </motion.div>
      )}

      {/* Специальный элемент */}
      {gem.special === 'bomb' && (
        <motion.div
          className="absolute inset-0 rounded-xl flex items-center justify-center"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          💣
        </motion.div>
      )}

      {gem.special === 'lightning' && (
        <motion.div
          className="absolute inset-0 rounded-xl flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ⚡
        </motion.div>
      )}

      {/* Эмодзи */}
      <span 
        className="text-2xl drop-shadow-lg"
        style={{ 
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
          fontSize: cellSize * 0.5,
        }}
      >
        {emoji}
      </span>

      {/* Блик */}
      <div 
        className="absolute top-1 left-1 right-1 h-1/3 rounded-t-xl"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
        }}
      />
    </motion.div>
  );
}
