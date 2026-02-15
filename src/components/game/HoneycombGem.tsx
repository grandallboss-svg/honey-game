'use client';

import { Gem as GemType, GEM_COLORS, GEM_EMOJIS } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';

interface HoneycombGemProps {
  gem: GemType;
  isSelected: boolean;
  onClick: () => void;
  cellSize: number;
}

// SVG путь для соты (hexagon)
const hexagonPath = (size: number) => {
  const w = size;
  const h = size * 1.15;
  const r = w * 0.5;
  const halfH = h * 0.5;
  
  return `M ${r} 0 
          L ${w} ${halfH * 0.5} 
          L ${w} ${halfH * 1.5} 
          L ${r} ${h} 
          L 0 ${halfH * 1.5} 
          L 0 ${halfH * 0.5} 
          Z`;
};

// Компонент осколка для взрыва
function Shard({ 
  color, 
  size, 
  angle, 
  delay 
}: { 
  color: string; 
  size: number; 
  angle: number; 
  delay: number;
}) {
  const distance = 60 + Math.random() * 80;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const rotation = Math.random() * 720 - 360;
  
  return (
    <motion.div
      className="absolute"
      style={{
        width: size,
        height: size * 1.15,
      }}
      initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
      animate={{ x, y, rotate: rotation, scale: [1, 0.8, 0.3, 0], opacity: [1, 1, 0.5, 0] }}
      transition={{ duration: 1.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <svg width={size} height={size * 1.15} viewBox="0 0 20 23">
        <defs>
          <linearGradient id={`shard-${color}-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="30%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <polygon
          points="10,0 20,5.75 20,17.25 10,23 0,17.25 0,5.75"
          fill={`url(#shard-${color}-${delay})`}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.5"
        />
      </svg>
    </motion.div>
  );
}

// Компонент искры
function Spark({ color, angle, delay }: { color: string; angle: number; delay: number }) {
  const distance = 40 + Math.random() * 60;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const size = 4 + Math.random() * 8;
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, white 0%, ${color} 50%, transparent 100%)`,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x, y, scale: [1, 1.5, 0], opacity: [1, 0.8, 0] }}
      transition={{ duration: 1.0, delay, ease: 'easeOut' }}
    />
  );
}

// Компонент взрыва
function Explosion({ color, cellSize }: { color: string; cellSize: number }) {
  const shards = [];
  const sparks = [];
  
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.3;
    shards.push(<Shard key={`shard-${i}`} color={color} size={12 + Math.random() * 10} angle={angle} delay={i * 0.02} />);
  }
  
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    sparks.push(<Spark key={`spark-${i}`} color={color} angle={angle} delay={i * 0.01} />);
  }
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: cellSize / 2, top: cellSize / 2, transform: 'translate(-50%, -50%)' }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: cellSize * 1.5,
          height: cellSize * 1.5,
          background: `radial-gradient(circle, white 0%, ${color} 30%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2, 2.5], opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.8 }}
      />
      {shards}
      {sparks}
    </motion.div>
  );
}

export function HoneycombGem({ gem, isSelected, onClick, cellSize }: HoneycombGemProps) {
  const bgColor = GEM_COLORS[gem.type];
  const emoji = GEM_EMOJIS[gem.type];
  
  const hexSize = cellSize - 6;
  const hexHeight = hexSize * 1.15;

  // Вычисляем целевую позицию
  const targetX = gem.position.col * cellSize + 3;
  const targetY = gem.position.row * cellSize + 3 - (hexSize * 0.075);

  return (
    <>
      {/* Взрыв при уничтожении */}
      <AnimatePresence>
        {gem.isMatched && <Explosion color={bgColor} cellSize={cellSize} />}
      </AnimatePresence>
      
      <motion.div
        className="absolute cursor-pointer select-none"
        key={gem.id}
        style={{
          width: hexSize,
          height: hexHeight,
          zIndex: isSelected ? 20 : gem.isMatched ? 0 : 1,
        }}
        animate={{
          left: targetX,
          top: targetY,
          scale: gem.isMatched ? 0 : 1,
          opacity: gem.isMatched ? 0 : 1,
        }}
        initial={gem.isNew ? { 
          left: targetX, 
          top: targetY - cellSize, 
          scale: 0, 
          opacity: 0 
        } : { left: targetX, top: targetY }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          left: { duration: 0.25, ease: 'easeOut' },
          top: { duration: 0.25, ease: 'easeOut' },
          scale: { duration: 0.2 },
          opacity: { duration: 0.2 },
        }}
        onClick={onClick}
        whileHover={{ scale: gem.isMatched ? 0 : 1.05, zIndex: 30 }}
        whileTap={{ scale: gem.isMatched ? 0 : 0.95 }}
      >
        {/* SVG сота */}
        <svg
          width={hexSize}
          height={hexHeight}
          viewBox={`0 0 ${hexSize} ${hexHeight}`}
          className="absolute inset-0"
        >
          <defs>
            {/* Тень - более тёмная */}
            <filter id={`shadow-${gem.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5"/>
            </filter>
            
            {/* Основной градиент - более насыщенный */}
            <radialGradient id={`gem-shine-${gem.id}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
              <stop offset="30%" stopColor={bgColor} stopOpacity="1"/>
              <stop offset="70%" stopColor={bgColor} stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0.3"/>
            </radialGradient>
            
            {/* Клип-маска для блика */}
            <clipPath id={`hex-clip-${gem.id}`}>
              <path d={hexagonPath(hexSize)} />
            </clipPath>
          </defs>

          {/* Основа соты - более контрастная */}
          <motion.path
            d={hexagonPath(hexSize)}
            fill={`url(#gem-shine-${gem.id})`}
            stroke={isSelected ? '#ffffff' : '#000000'}
            strokeWidth={isSelected ? 3 : 1}
            filter={`url(#shadow-${gem.id})`}
            animate={{
              stroke: isSelected ? ['#ffffff', bgColor, '#ffffff'] : '#000000',
              strokeWidth: isSelected ? [3, 4, 3] : 1,
            }}
            transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0 }}
          />

          {/* Внутренняя граница - тоньше */}
          <path
            d={hexagonPath(hexSize * 0.88)}
            fill="transparent"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={0.5}
            transform={`translate(${hexSize * 0.06}, ${hexHeight * 0.06})`}
          />
        </svg>

        {/* Тонкий блик - только один, более прозрачный */}
        {!gem.isMatched && (
          <motion.div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              clipPath: `polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)`,
            }}
          >
            {/* Один тонкий движущийся блик */}
            <motion.div
              className="absolute"
              style={{
                width: hexSize * 2,
                height: hexHeight * 2,
                background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
              }}
              animate={{
                x: [-hexSize, hexSize],
                y: [-hexHeight, hexHeight],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
                repeatDelay: 3,
              }}
            />

            {/* Верхний маленький блик */}
            <div
              className="absolute top-1 left-1/3 right-1/3 h-1 rounded-full"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
              }}
            />
          </motion.div>
        )}

        {/* Пульсирующее свечение при выборе */}
        {isSelected && !gem.isMatched && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg width={hexSize} height={hexHeight} viewBox={`0 0 ${hexSize} ${hexHeight}`}>
              <path
                d={hexagonPath(hexSize)}
                fill="rgba(255,255,255,0.2)"
                stroke="white"
                strokeWidth={3}
                strokeDasharray="5,3"
              />
            </svg>
          </motion.div>
        )}

        {/* Эмодзи по центру - крупнее */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: hexSize * 0.5 }}
          animate={{
            scale: gem.isMatched ? [1, 1.5, 0] : [1, 1.02, 1],
            opacity: gem.isMatched ? [1, 0.5, 0] : 1,
          }}
          transition={{
            scale: { duration: gem.isMatched ? 0.5 : 5, repeat: gem.isMatched ? 0 : Infinity },
            opacity: { duration: gem.isMatched ? 0.5 : 0 },
          }}
        >
          {emoji}
        </motion.div>

        {/* Бонусный индикатор */}
        {gem.bonusReward && !gem.isMatched && (
          <motion.div
            className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg border border-white/50"
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.5, repeat: Infinity } }}
          >
            💎
          </motion.div>
        )}

        {/* Специальные элементы - крупнее иконки */}
        {gem.special === 'bomb' && !gem.isMatched && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <span style={{ fontSize: hexSize * 0.45 }}>💣</span>
          </motion.div>
        )}

        {gem.special === 'lightning' && !gem.isMatched && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span style={{ fontSize: hexSize * 0.45 }}>⚡</span>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
