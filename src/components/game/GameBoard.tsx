'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoneycombGem } from './HoneycombGem';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONFIG, Gem } from '@/types/game';
import { ExplosionEffect, createMatchEffect, Particle } from './ParticleEffects';
import { soundManager } from '@/lib/game/sounds';
import {
  LightningEffect,
  ExplosionFireEffect,
  HoneyBlastEffect,
  BeeSwarmEffect
} from './WeaponEffects';

export function GameBoard() {
  const {
    board,
    selectGem,
    selectedGem,
    isAnimating,
    combo,
    bonusActive,
    weaponEffect,
  } = useGameStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(55);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMatchedRef = useRef<Set<string>>(new Set());

  // Инициализация звуков
  useEffect(() => {
    soundManager.init();
  }, []);

  // Звук при комбо
  useEffect(() => {
    if (combo > 1) {
      soundManager.playCombo(combo);
    }
  }, [combo]);

  // Звук при бонусе
  useEffect(() => {
    if (bonusActive) {
      if (bonusActive.type === 'crypto') {
        soundManager.playCryptoBonus();
      } else {
        soundManager.playBonus();
      }
    }
  }, [bonusActive]);

  // Рассчитываем размер ячейки по ширине (6 колонок)
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const maxWidth = Math.min(containerWidth, 400);
        // Размер ячейки = ширина контейнера / количество колонок
        setCellSize(Math.floor(maxWidth / GAME_CONFIG.BOARD_WIDTH));
      }
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);

  // Размеры поля: ширина = 6 ячеек, высота = 10 ячеек
  const boardWidth = cellSize * GAME_CONFIG.BOARD_WIDTH;
  const boardHeight = cellSize * GAME_CONFIG.BOARD_HEIGHT;

  const handleCellClick = (row: number, col: number) => {
    if (isAnimating) return;

    if (selectedGem) {
      soundManager.playSelect();
    } else {
      soundManager.playClick();
    }

    selectGem({ row, col });
  };

  // Отслеживаем уничтоженные ячейки
  useEffect(() => {
    const currentMatched = new Set<string>();
    const newMatches: { gem: Gem; x: number; y: number }[] = [];

    board.forEach((row, rowIndex) => {
      row.forEach((gem, colIndex) => {
        if (gem?.isMatched) {
          const key = `${rowIndex}-${colIndex}`;
          currentMatched.add(key);

          if (!prevMatchedRef.current.has(key)) {
            const x = colIndex * cellSize + cellSize / 2;
            const y = rowIndex * cellSize + cellSize / 2;
            newMatches.push({ gem, x, y });
          }
        }
      });
    });

    prevMatchedRef.current = currentMatched;

    if (newMatches.length > 0) {
      const allParticles: Particle[] = [];

      newMatches.forEach(({ gem, x, y }) => {
        allParticles.push(...createMatchEffect(x, y, gem.type));
      });

      if (particlesTimeoutRef.current) {
        clearTimeout(particlesTimeoutRef.current);
      }

      queueMicrotask(() => {
        setParticles(prev => [...prev, ...allParticles]);
        soundManager.playMatch(combo);
      });

      particlesTimeoutRef.current = setTimeout(() => {
        setParticles([]);
      }, 1000);
    }

    return () => {
      if (particlesTimeoutRef.current) {
        clearTimeout(particlesTimeoutRef.current);
      }
    };
  }, [board, cellSize, combo]);

  // Вычисляем координаты для эффектов оружия
  const getWeaponEffectProps = () => {
    if (!weaponEffect) return null;
    const { position } = weaponEffect;
    const centerX = position.col * cellSize + cellSize / 2;
    const centerY = position.row * cellSize + cellSize / 2;

    return {
      centerX,
      centerY,
      x: centerX,
      y: centerY,
      cellSize,
      boardWidth,
      boardHeight,
    };
  };

  const effectProps = getWeaponEffectProps();

  return (
    <div
      ref={containerRef}
      className="relative mx-auto"
      style={{
        width: boardWidth,
        height: boardHeight,
      }}
    >
      {/* Фон - более тёмный */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at center, rgba(50, 30, 10, 0.4) 0%, rgba(30, 15, 5, 0.7) 100%)`,
          boxShadow: `inset 0 0 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)`,
        }}
      >
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="hexPattern" width={cellSize} height={cellSize * 1.15} patternUnits="userSpaceOnUse">
              <polygon
                points={`${cellSize/2},0 ${cellSize},${cellSize * 0.2875} ${cellSize},${cellSize * 0.8625} ${cellSize/2},${cellSize * 1.15} 0,${cellSize * 0.8625} 0,${cellSize * 0.2875}`}
                fill="none"
                stroke="rgba(139, 90, 43, 0.4)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexPattern)" />
        </svg>
      </div>

      {/* Ячейки */}
      <div className="absolute inset-0" style={{ width: boardWidth, height: boardHeight }}>
        {board.map((row, rowIndex) =>
          row.map((gem, colIndex) =>
            gem ? (
              <HoneycombGem
                key={gem.id}
                gem={gem}
                isSelected={selectedGem?.row === rowIndex && selectedGem?.col === colIndex}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                cellSize={cellSize}
              />
            ) : null
          )
        )}
      </div>

      {/* Эффекты частиц */}
      <AnimatePresence>
        {particles.length > 0 && <ExplosionEffect particles={particles} />}
      </AnimatePresence>

      {/* Эффекты оружия - рендерим поверх всего */}
      <AnimatePresence>
        {weaponEffect && effectProps && (
          <>
            {weaponEffect.type === 'lightning' && (
              <LightningEffect
                centerX={effectProps.centerX}
                centerY={effectProps.centerY}
                cellSize={cellSize}
                boardWidth={boardWidth}
                boardHeight={boardHeight}
              />
            )}
            {weaponEffect.type === 'dynamite' && (
              <ExplosionFireEffect
                x={effectProps.x}
                y={effectProps.y}
                cellSize={cellSize}
              />
            )}
            {weaponEffect.type === 'honeyblast' && (
              <HoneyBlastEffect
                x={effectProps.x}
                y={effectProps.y}
                cellSize={cellSize}
              />
            )}
            {weaponEffect.type === 'beeswarm' && (
              <BeeSwarmEffect
                x={effectProps.x}
                y={effectProps.y}
                cellSize={cellSize}
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Оверлей при комбо */}
      <AnimatePresence>
        {combo > 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, rgba(255, 200, 0, ${0.1 * combo}) 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Подсветка выбранного элемента */}
      {selectedGem && !isAnimating && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: cellSize,
            height: cellSize,
            left: selectedGem.col * cellSize,
            top: selectedGem.row * cellSize,
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-full h-full rounded-xl border-3 border-white"
            style={{ boxShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 183, 0, 0.3)' }}
          />
        </motion.div>
      )}
    </div>
  );
}
