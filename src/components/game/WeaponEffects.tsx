'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { GAME_CONFIG } from '@/types/game';

// Эффект молнии / электрошокера - уничтожает строку и колонку
export function LightningEffect({
  centerX,
  centerY,
  cellSize,
  boardWidth,
  boardHeight,
}: {
  centerX: number;
  centerY: number;
  cellSize: number;
  boardWidth: number;
  boardHeight: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {/* Вертикальная молния (колонка) */}
      <VerticalLightning
        x={centerX}
        startY={0}
        endY={boardHeight}
        delay={0}
      />

      {/* Горизонтальная молния (строка) */}
      <HorizontalLightning
        y={centerY}
        startX={0}
        endX={boardWidth}
        delay={0.05}
      />

      {/* Центральная вспышка */}
      <motion.div
        className="absolute"
        style={{
          left: centerX,
          top: centerY,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 3, 2, 0], opacity: [0, 1, 0.8, 0] }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div
          className="w-20 h-20 rounded-full"
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, #00ffff 30%, #0088ff 60%, transparent 100%)',
            boxShadow: '0 0 60px #00ffff, 0 0 100px #0088ff',
          }}
        />
      </motion.div>

      {/* Электрические дуги в центре */}
      {[...Array(8)].map((_, i) => {
        const angle = (Math.PI * 2 * i) / 8;
        return (
          <motion.div
            key={`arc-${i}`}
            className="absolute"
            style={{
              left: centerX,
              top: centerY,
              width: 80,
              height: 4,
              background: 'linear-gradient(90deg, transparent, #00ffff, #ffffff, #00ffff, transparent)',
              transformOrigin: 'left center',
              transform: `rotate(${angle}rad)`,
              filter: 'blur(1px)',
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: [0, 1, 0], scaleX: [0, 1.5, 0] }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
        );
      })}

      {/* Искры по всей длине вертикально */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: centerX + (Math.random() - 0.5) * 20,
            top: Math.random() * boardHeight,
            background: '#00ffff',
            boxShadow: '0 0 8px #00ffff, 0 0 16px #0088ff',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 60,
            y: (Math.random() - 0.5) * 40,
            scale: [0, 1.5, 0],
            opacity: [1, 0.5, 0],
          }}
          transition={{ duration: 0.3 + Math.random() * 0.3, delay: Math.random() * 0.2 }}
        />
      ))}

      {/* Горизонтальные искры */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`hspark-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: Math.random() * boardWidth,
            top: centerY + (Math.random() - 0.5) * 20,
            background: '#ffffff',
            boxShadow: '0 0 10px #00ffff',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            y: (Math.random() - 0.5) * 60,
            scale: [0, 1.2, 0],
            opacity: [1, 0.5, 0],
          }}
          transition={{ duration: 0.3 + Math.random() * 0.3, delay: Math.random() * 0.2 }}
        />
      ))}
    </div>
  );
}

// Вертикальная молния
function VerticalLightning({ x, startY, endY, delay }: { x: number; startY: number; endY: number; delay: number }) {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const segments = 20;
    const pts: { x: number; y: number }[] = [];
    const segmentHeight = (endY - startY) / segments;

    for (let i = 0; i <= segments; i++) {
      pts.push({
        x: x + (i === 0 || i === segments ? 0 : (Math.random() - 0.5) * 30),
        y: startY + i * segmentHeight,
      });
    }
    
    // Используем queueMicrotask для избежания cascading renders
    queueMicrotask(() => setPoints(pts));
  }, [x, startY, endY]);

  if (points.length < 2) return null;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: 51 }}>
      <defs>
        <filter id="glow-blue" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Внешнее свечение */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#0044ff"
        strokeWidth={12}
        strokeLinecap="round"
        filter="url(#glow-blue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 0.6, 0.4, 0] }}
        transition={{ duration: 0.5, delay }}
      />

      {/* Средний слой */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#00ffff"
        strokeWidth={6}
        strokeLinecap="round"
        filter="url(#glow-blue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 0.7, 0] }}
        transition={{ duration: 0.5, delay }}
      />

      {/* Внутренняя яркость */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 0.8, 0] }}
        transition={{ duration: 0.5, delay }}
      />
    </svg>
  );
}

// Горизонтальная молния
function HorizontalLightning({ y, startX, endX, delay }: { y: number; startX: number; endX: number; delay: number }) {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const segments = 20;
    const pts: { x: number; y: number }[] = [];
    const segmentWidth = (endX - startX) / segments;

    for (let i = 0; i <= segments; i++) {
      pts.push({
        x: startX + i * segmentWidth,
        y: y + (i === 0 || i === segments ? 0 : (Math.random() - 0.5) * 30),
      });
    }
    
    // Используем queueMicrotask для избежания cascading renders
    queueMicrotask(() => setPoints(pts));
  }, [y, startX, endX]);

  if (points.length < 2) return null;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: 51 }}>
      {/* Внешнее свечение */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#0044ff"
        strokeWidth={12}
        strokeLinecap="round"
        filter="url(#glow-blue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 0.6, 0.4, 0] }}
        transition={{ duration: 0.5, delay }}
      />

      {/* Средний слой */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#00ffff"
        strokeWidth={6}
        strokeLinecap="round"
        filter="url(#glow-blue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 0.7, 0] }}
        transition={{ duration: 0.5, delay }}
      />

      {/* Внутренняя яркость */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 0.8, 0] }}
        transition={{ duration: 0.5, delay }}
      />
    </svg>
  );
}

// Эффект огненного взрыва для динамита
export function ExplosionFireEffect({
  x,
  y,
  cellSize,
}: {
  x: number;
  y: number;
  cellSize: number;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {/* Яркий центр (белый → жёлтый) */}
      <motion.div
        className="absolute"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 3, 2.5, 0], opacity: [1, 1, 0.7, 0] }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div
          className="w-24 h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, #ffff88 30%, #ffaa00 60%, #ff4400 85%, transparent 100%)',
            boxShadow: '0 0 80px #ffffff, 0 0 120px #ffaa00, 0 0 160px #ff4400',
          }}
        />
      </motion.div>

      {/* Огненные кольца расходятся от центра */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full"
          style={{
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
            border: `4px solid ${['#ffffff', '#ffcc00', '#ff6600'][i]}`,
            boxShadow: `0 0 20px ${['#ffffff', '#ffcc00', '#ff6600'][i]}`,
          }}
          initial={{ width: 10, height: 10, opacity: 1 }}
          animate={{
            width: cellSize * (4 + i * 1.5),
            height: cellSize * (4 + i * 1.5),
            opacity: [1, 0.7, 0.3, 0],
          }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
        />
      ))}

      {/* Огненные шары разлетаются */}
      {[...Array(20)].map((_, i) => {
        const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.3;
        const distance = cellSize * 1.5 + Math.random() * cellSize * 1.5;
        const size = 20 + Math.random() * 30;

        return (
          <motion.div
            key={`fireball-${i}`}
            className="absolute rounded-full"
            style={{
              left: x,
              top: y,
              width: size,
              height: size,
              background: `radial-gradient(circle, #ffffff 0%, #ffff00 20%, #ff8800 50%, #ff4400 80%, transparent 100%)`,
              boxShadow: '0 0 30px #ff6600, 0 0 60px #ff3300',
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 30, // Немного вверх
              scale: [1, 1.3, 0.6, 0],
              opacity: [1, 0.8, 0.4, 0],
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        );
      })}

      {/* Искры и пепел поднимаются вверх */}
      {[...Array(40)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = cellSize * 1 + Math.random() * cellSize * 2;
        const size = 3 + Math.random() * 6;
        const colors = ['#ffffff', '#ffff00', '#ff8800', '#ff4400', '#ff0000'];

        return (
          <motion.div
            key={`spark-${i}`}
            className="absolute rounded-full"
            style={{
              left: x,
              top: y,
              width: size,
              height: size,
              background: colors[Math.floor(Math.random() * colors.length)],
              boxShadow: `0 0 ${size * 2}px currentColor`,
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance * 0.5,
              y: Math.sin(angle) * distance - 40 - Math.random() * 60,
              opacity: [1, 0.8, 0.4, 0],
            }}
            transition={{ duration: 1 + Math.random() * 0.5, ease: 'easeOut' }}
          />
        );
      })}

      {/* Дым появляется после взрыва */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`smoke-${i}`}
          className="absolute rounded-full blur-lg"
          style={{
            left: x + (Math.random() - 0.5) * cellSize * 1.5,
            top: y + (Math.random() - 0.5) * cellSize * 0.5,
            width: 40 + Math.random() * 40,
            height: 40 + Math.random() * 40,
            background: `rgba(${80 + Math.random() * 40}, ${80 + Math.random() * 40}, ${80 + Math.random() * 40}, 0.6)`,
          }}
          initial={{ y: 0, scale: 0.5, opacity: 0 }}
          animate={{
            y: -cellSize * 2 - Math.random() * cellSize,
            scale: [0.5, 2, 3],
            opacity: [0, 0.4, 0.2, 0],
          }}
          transition={{ duration: 2, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
        />
      ))}

      {/* Осколки */}
      {[...Array(12)].map((_, i) => {
        const angle = (Math.PI * 2 * i) / 12;
        const distance = cellSize * 2 + Math.random() * cellSize;

        return (
          <motion.div
            key={`debris-${i}`}
            className="absolute"
            style={{
              left: x,
              top: y,
              width: 8,
              height: 12,
              background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #8B4513 100%)',
              borderRadius: 2,
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 20,
              rotate: Math.random() * 720 - 360,
              opacity: [1, 1, 0.5, 0],
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        );
      })}

      {/* Огненная вспышка на весь экран */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 200, 0, 0.4) 0%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

// Эффект медового взрыва
export function HoneyBlastEffect({
  x,
  y,
  cellSize,
}: {
  x: number;
  y: number;
  cellSize: number;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {/* Медовая волна */}
      <motion.div
        className="absolute"
        style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 10, 12], opacity: [0.9, 0.6, 0] }}
        transition={{ duration: 0.8 }}
      >
        <div
          className="w-8 h-8 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 220, 0, 0.9) 0%, rgba(255, 180, 0, 0.6) 50%, transparent 100%)',
            boxShadow: '0 0 60px rgba(255, 180, 0, 0.8)',
          }}
        />
      </motion.div>

      {/* Капли мёда */}
      {[...Array(25)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = cellSize * 2 + Math.random() * cellSize * 2.5;

        return (
          <motion.div
            key={`honey-${i}`}
            className="absolute"
            style={{
              left: x,
              top: y,
              width: 15 + Math.random() * 20,
              height: 20 + Math.random() * 25,
              background: 'linear-gradient(180deg, #ffdd00 0%, #ffaa00 50%, #ff8800 100%)',
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              boxShadow: '0 0 15px rgba(255, 180, 0, 0.6)',
            }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance + 20,
              scale: [0, 1.2, 0.8, 0],
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

// Эффект роя пчёл
export function BeeSwarmEffect({
  x,
  y,
  cellSize,
}: {
  x: number;
  y: number;
  cellSize: number;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {/* Центральный вихрь */}
      <motion.div
        className="absolute"
        style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 3, 0], rotate: 360 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-16 h-16 rounded-full bg-amber-400/50 blur-md" />
      </motion.div>

      {/* Пчёлы */}
      {[...Array(30)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const startDistance = Math.random() * cellSize * 0.5;
        const endDistance = cellSize * 2 + Math.random() * cellSize * 3;

        return (
          <motion.div
            key={`bee-${i}`}
            className="absolute text-2xl"
            style={{
              left: x + Math.cos(angle) * startDistance,
              top: y + Math.sin(angle) * startDistance,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * (endDistance - startDistance) + (Math.random() - 0.5) * cellSize,
              y: Math.sin(angle) * (endDistance - startDistance) + (Math.random() - 0.5) * cellSize,
              scale: [0, 1.5, 1, 0],
              opacity: [1, 1, 0.5, 0],
              rotate: [0, 360, 720],
            }}
            transition={{ duration: 1.2, delay: Math.random() * 0.3, ease: 'easeOut' }}
          >
            🐝
          </motion.div>
        );
      })}

      {/* Жёлтые следы */}
      {[...Array(20)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = cellSize * 1 + Math.random() * cellSize * 2.5;

        return (
          <motion.div
            key={`trail-${i}`}
            className="absolute rounded-full"
            style={{
              left: x,
              top: y,
              width: 10 + Math.random() * 10,
              height: 10 + Math.random() * 10,
              background: 'rgba(255, 200, 0, 0.7)',
              boxShadow: '0 0 10px rgba(255, 180, 0, 0.5)',
            }}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0, 1.2, 0.6, 0],
              opacity: [0.9, 0.5, 0],
            }}
            transition={{ duration: 0.8, delay: Math.random() * 0.3 }}
          />
        );
      })}
    </div>
  );
}
