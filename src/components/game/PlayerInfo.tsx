'use client';

import { Player } from '@/types/game';
import { Coins, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerInfoProps {
  player: Player;
}

export function PlayerInfo({ player }: PlayerInfoProps) {
  const displayName = player.username || player.firstName || 'Пчела';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-amber-800/90 to-amber-700/90 rounded-2xl p-3 shadow-lg border border-amber-600/30"
    >
      <div className="flex items-center gap-3">
        {/* Аватар */}
        <div className="relative">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl border-2 border-amber-300">
              🐝
            </div>
          )}
          <motion.div
            className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border border-amber-300"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {player.level}
          </motion.div>
        </div>

        {/* Информация */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white truncate">{displayName}</h2>
            <motion.span
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              className="text-sm"
            >
              🐝
            </motion.span>
          </div>
          
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1">
              <span className="text-sm">🍯</span>
              <span className="text-amber-200 text-sm font-medium">
                {player.nectar.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-amber-200 text-sm font-medium">
                {player.medBalance.toFixed(4)} MED
              </span>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="text-right">
          <div className="text-xs text-amber-300">Всего нектара</div>
          <div className="text-lg font-bold text-white">
            {player.totalNectar.toLocaleString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
