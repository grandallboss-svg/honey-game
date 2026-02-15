'use client';

import { motion } from 'framer-motion';
import { GEM_COLORS } from '@/types/game';

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  type: 'shard' | 'spark' | 'star' | 'ring' | 'glow' | 'hex';
  gemType?: string;
}

interface ExplosionEffectProps {
  particles: Particle[];
}

// SVG путь для шестиугольника (осколок соты)
const HexShard = ({ color, size }: { color: string; size: number }) => (
  <svg
    width={size}
    height={size * 1.15}
    viewBox="0 0 20 23"
    className="drop-shadow-lg"
  >
    <defs>
      <linearGradient id={`shard-grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0.8" />
        <stop offset="30%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0.7" />
      </linearGradient>
    </defs>
    <polygon
      points="10,0 20,5.75 20,17.25 10,23 0,17.25 0,5.75"
      fill={`url(#shard-grad-${color})`}
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="0.5"
    />
  </svg>
);

export function ExplosionEffect({ particles }: ExplosionEffectProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
          }}
          initial={{
            scale: 1,
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
          }}
          animate={{
            scale: [1, 0.8, 0.3, 0],
            opacity: [1, 1, 0.5, 0],
            x: particle.velocity.x * 150,
            y: particle.velocity.y * 150,
            rotate: particle.rotation * 360,
          }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {particle.type === 'hex' && (
            <HexShard color={particle.color} size={particle.size} />
          )}
          
          {particle.type === 'shard' && (
            <div
              className="rounded-sm"
              style={{
                width: particle.size,
                height: particle.size * 1.5,
                background: `linear-gradient(135deg, white 0%, ${particle.color} 50%, ${particle.color}80 100%)`,
                transform: `rotate(${particle.rotation * 45}deg)`,
                boxShadow: `0 0 ${particle.size/2}px ${particle.color}`,
              }}
            />
          )}
          
          {particle.type === 'spark' && (
            <motion.div
              className="rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                background: `radial-gradient(circle, white 0%, ${particle.color} 40%, transparent 70%)`,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}, 0 0 ${particle.size * 4}px ${particle.color}50`,
              }}
              animate={{
                scale: [1, 1.5, 0],
              }}
              transition={{ duration: 0.4 }}
            />
          )}
          
          {particle.type === 'star' && (
            <div
              style={{
                width: particle.size,
                height: particle.size,
                background: particle.color,
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                filter: 'drop-shadow(0 0 3px white)',
              }}
            />
          )}
          
          {particle.type === 'ring' && (
            <div
              className="rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                border: `2px solid ${particle.color}`,
                boxShadow: `0 0 10px ${particle.color}, inset 0 0 5px ${particle.color}50`,
              }}
            />
          )}
          
          {particle.type === 'glow' && (
            <div
              className="rounded-full blur-md"
              style={{
                width: particle.size,
                height: particle.size,
                background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Создание взрыва с осколками сот
export function createExplosionWithShards(
  x: number, 
  y: number, 
  color: string, 
  gemType?: string
): Particle[] {
  const particles: Particle[] = [];
  const shardCount = 6 + Math.floor(Math.random() * 4); // 6-10 осколков
  
  // Создаём осколки в форме сот
  for (let i = 0; i < shardCount; i++) {
    const angle = (Math.PI * 2 * i) / shardCount + (Math.random() - 0.5) * 0.5;
    const speed = 1.5 + Math.random() * 2;
    
    particles.push({
      id: `hex-shard-${Date.now()}-${i}-${Math.random()}`,
      x,
      y,
      color,
      size: 12 + Math.random() * 16,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 0.5, // Немного вверх
      },
      rotation: Math.random() * 3 - 1,
      rotationSpeed: (Math.random() - 0.5) * 10,
      type: 'hex',
      gemType,
    });
  }
  
  // Добавляем искры
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;
    
    particles.push({
      id: `spark-${Date.now()}-${i}-${Math.random()}`,
      x,
      y,
      color,
      size: 3 + Math.random() * 6,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      rotation: Math.random() * 2 - 1,
      rotationSpeed: 0,
      type: 'spark',
    });
  }
  
  // Добавляем свечение
  particles.push({
    id: `glow-${Date.now()}-${Math.random()}`,
    x,
    y,
    color,
    size: 40 + Math.random() * 20,
    velocity: { x: 0, y: 0 },
    rotation: 0,
    rotationSpeed: 0,
    type: 'glow',
  });

  return particles;
}

// Создание эффекта матча с осколками
export function createMatchEffect(x: number, y: number, gemType: string): Particle[] {
  const color = GEM_COLORS[gemType as keyof typeof GEM_COLORS] || '#FFB800';
  return createExplosionWithShards(x, y, color, gemType);
}

// Создание эффекта взрыва
export function createExplosion(x: number, y: number, color: string, count = 15): Particle[] {
  const particles: Particle[] = [];
  const types: Particle['type'][] = ['spark', 'star', 'ring', 'glow'];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 0.5 + Math.random() * 1.5;
    const type = types[Math.floor(Math.random() * types.length)];

    particles.push({
      id: `particle-${Date.now()}-${i}-${Math.random()}`,
      x,
      y,
      color,
      size: 4 + Math.random() * 12,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      rotation: Math.random() * 2 - 1,
      rotationSpeed: 0,
      type,
    });
  }

  return particles;
}

// Создание эффекта комбо
export function createComboEffect(x: number, y: number, comboLevel: number): Particle[] {
  const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF0000', '#FF1493'];
  const particleCount = 10 + comboLevel * 5;
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2 + comboLevel * 0.3;
    const color = colors[Math.min(comboLevel - 1, colors.length - 1)];

    particles.push({
      id: `combo-${Date.now()}-${i}-${Math.random()}`,
      x,
      y,
      color,
      size: 6 + Math.random() * 15,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      rotation: Math.random() * 4 - 2,
      rotationSpeed: 0,
      type: Math.random() > 0.5 ? 'star' : 'spark',
    });
  }

  return particles;
}

// Создание эффекта оружия
export function createWeaponEffect(
  x: number,
  y: number,
  weaponType: string,
  cellSize: number
): Particle[] {
  const particles: Particle[] = [];
  
  switch (weaponType) {
    case 'lightning':
      for (let i = 0; i < 30; i++) {
        particles.push({
          id: `lightning-${Date.now()}-${i}-${Math.random()}`,
          x: x + (Math.random() - 0.5) * 20,
          y: y + Math.random() * cellSize * 8,
          color: '#00BFFF',
          size: 8 + Math.random() * 8,
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: -Math.random() * 2,
          },
          rotation: 0,
          rotationSpeed: 0,
          type: 'glow',
        });
      }
      break;
      
    case 'dynamite':
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const colors = ['#FF4500', '#FFD700', '#FF0000', '#FFA500'];
        
        particles.push({
          id: `dynamite-${Date.now()}-${i}-${Math.random()}`,
          x,
          y,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 10 + Math.random() * 20,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          rotation: Math.random() * 4 - 2,
          rotationSpeed: 0,
          type: Math.random() > 0.5 ? 'spark' : 'ring',
        });
      }
      break;
      
    case 'honeyblast':
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2;
        
        particles.push({
          id: `honey-${Date.now()}-${i}-${Math.random()}`,
          x,
          y,
          color: '#FFB800',
          size: 8 + Math.random() * 15,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          rotation: 0,
          rotationSpeed: 0,
          type: 'glow',
        });
      }
      break;
      
    case 'beeswarm':
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        
        particles.push({
          id: `bee-${Date.now()}-${i}-${Math.random()}`,
          x: x + (Math.random() - 0.5) * cellSize * 4,
          y: y + (Math.random() - 0.5) * cellSize * 4,
          color: '#FFD700',
          size: 5 + Math.random() * 8,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          rotation: Math.random() * 10,
          rotationSpeed: 0,
          type: 'star',
        });
      }
      break;
  }
  
  return particles;
}
