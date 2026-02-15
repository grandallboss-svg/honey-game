'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { LEVELS, WEAPONS, ACHIEVEMENTS, GAME_CONFIG } from '@/types/game';
import { X, Trophy, Coins, Zap, Star, Package, ShoppingBag, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'stats' | 'inventory' | 'shop' | 'achievements';

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { player, inventory, addGold, spendGold, addToInventory } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  if (!isOpen || !player) return null;

  const currentLevel = LEVELS.find(
    (l, i) => (LEVELS[i + 1]?.requiredNectar ?? Infinity) > player.totalNectar
  ) || LEVELS[0];

  const tabs = [
    { id: 'stats' as TabType, label: 'Статистика', icon: TrendingUp },
    { id: 'inventory' as TabType, label: 'Инвентарь', icon: Package },
    { id: 'shop' as TabType, label: 'Магазин', icon: ShoppingBag },
    { id: 'achievements' as TabType, label: 'Достижения', icon: Award },
  ];

  const handleBuyWeapon = (weaponId: string) => {
    const weapon = WEAPONS.find(w => w.id === weaponId);
    if (!weapon) return;
    
    if (player.gold >= weapon.goldPrice) {
      if (spendGold(weapon.goldPrice)) {
        addToInventory(weapon, 1);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 rounded-3xl w-full max-w-lg shadow-2xl border border-amber-600/30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Шапка профиля */}
          <div className="relative bg-gradient-to-r from-amber-600 to-amber-500 p-4">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.firstName || 'Player'}
                  className="w-16 h-16 rounded-full border-3 border-white/30 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl border-3 border-white/30">
                  🐝
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">
                  {player.username || player.firstName || 'Пчела'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-amber-900/30 text-amber-100 px-2 py-0.5 rounded-full text-sm">
                    Ур. {currentLevel.level}
                  </span>
                  <span className="text-amber-100/80 text-sm">
                    {currentLevel.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Балансы */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-amber-900/30 rounded-xl p-2 text-center">
                <div className="text-amber-200 text-xs">Нектар</div>
                <div className="text-white font-bold flex items-center justify-center gap-1">
                  🍯 {player.nectar.toLocaleString()}
                </div>
              </div>
              <div className="bg-amber-900/30 rounded-xl p-2 text-center">
                <div className="text-amber-200 text-xs">Золото</div>
                <div className="text-yellow-300 font-bold flex items-center justify-center gap-1">
                  💰 {player.gold.toLocaleString()}
                </div>
              </div>
              <div className="bg-amber-900/30 rounded-xl p-2 text-center">
                <div className="text-amber-200 text-xs">MED</div>
                <div className="text-purple-300 font-bold flex items-center justify-center gap-1">
                  💎 {player.medBalance.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Табы */}
          <div className="flex border-b border-amber-600/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-900/20'
                    : 'text-amber-100/60 hover:text-amber-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mx-auto mb-1" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Контент табов */}
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {/* Статистика */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={Trophy} label="Всего очков" value={player.totalScore.toLocaleString()} />
                  <StatCard icon={Star} label="Всего нектара" value={player.totalNectar.toLocaleString()} />
                  <StatCard icon="🎮" label="Игр сыграно" value={player.gamesPlayed.toString()} />
                  <StatCard icon="🔥" label="Макс. комбо" value={`x${player.maxCombo}`} />
                  <StatCard icon="💫" label="Матчей" value={player.matchesMade.toLocaleString()} />
                  <StatCard icon="💎" label="Бонусов" value={player.bonusesCollected.toString()} />
                </div>

                {/* Прогресс уровня */}
                <div className="bg-amber-950/50 rounded-xl p-4">
                  <div className="flex justify-between text-sm text-amber-300 mb-2">
                    <span>Прогресс до следующего уровня</span>
                    <span>{player.totalNectar.toLocaleString()} / {(LEVELS[currentLevel.level]?.requiredNectar || '∞').toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-amber-900 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, ((player.totalNectar / (LEVELS[currentLevel.level]?.requiredNectar || player.totalNectar + 1)) * 100))}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Обмен нектара */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-medium">Обменять нектар на MED</div>
                      <div className="text-amber-300 text-sm">
                        {GAME_CONFIG.NECTAR_TO_MED.toLocaleString()} нектара = 1 MED
                      </div>
                    </div>
                    <Button
                      disabled={player.nectar < GAME_CONFIG.NECTAR_TO_MED}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50"
                    >
                      Обменять
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-3">
                {inventory.length === 0 ? (
                  <div className="text-center py-8 text-amber-300/60">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Инвентарь пуст</p>
                    <p className="text-sm">Купите оружие в магазине или получите его в игре!</p>
                  </div>
                ) : (
                  inventory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-amber-950/50 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="text-4xl">{item.weapon.icon}</div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{item.weapon.name}</div>
                        <div className="text-amber-300 text-sm">{item.weapon.description}</div>
                      </div>
                      <div className="bg-amber-600/30 rounded-lg px-3 py-1 text-amber-100 font-bold">
                        x{item.quantity}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-amber-300">Ваше золото:</span>
                  <span className="text-yellow-300 font-bold flex items-center gap-1">
                    💰 {player.gold.toLocaleString()}
                  </span>
                </div>
                
                {WEAPONS.map((weapon) => {
                  const canBuy = player.gold >= weapon.goldPrice && player.level >= weapon.minLevel;
                  const hasInInventory = inventory.some(i => i.weaponId === weapon.id);
                  
                  return (
                    <div
                      key={weapon.id}
                      className={`bg-amber-950/50 rounded-xl p-4 border ${
                        canBuy ? 'border-amber-600/30' : 'border-red-900/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{weapon.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{weapon.name}</span>
                            {hasInInventory && (
                              <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">
                                В инвентаре
                              </span>
                            )}
                          </div>
                          <div className="text-amber-300 text-sm">{weapon.description}</div>
                          <div className="text-amber-400/60 text-xs mt-1">
                            Ур. {weapon.minLevel}+ • Шанс выпадения: {(weapon.dropChance * 100).toFixed(1)}%
                          </div>
                        </div>
                        <Button
                          onClick={() => handleBuyWeapon(weapon.id)}
                          disabled={!canBuy}
                          className={`${
                            canBuy
                              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-amber-900'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            💰 {weapon.goldPrice}
                          </span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-3">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = player.achievements?.some(a => a.achievementId === achievement.id);
                  let progress = 0;
                  
                  switch (achievement.type) {
                    case 'games':
                      progress = player.gamesPlayed;
                      break;
                    case 'nectar':
                      progress = player.totalNectar;
                      break;
                    case 'combos':
                      progress = player.maxCombo;
                      break;
                    case 'score':
                      progress = player.totalScore;
                      break;
                  }
                  
                  const progressPercent = Math.min(100, (progress / achievement.requirement) * 100);
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`bg-amber-950/50 rounded-xl p-4 border ${
                        isUnlocked ? 'border-green-500/30' : 'border-amber-600/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isUnlocked ? 'text-white' : 'text-amber-100/60'}`}>
                              {achievement.name}
                            </span>
                            {isUnlocked && (
                              <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="text-amber-300/70 text-sm">{achievement.description}</div>
                          
                          {!isUnlocked && (
                            <div className="mt-2">
                              <div className="h-1.5 bg-amber-900 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <div className="text-xs text-amber-400/60 mt-1">
                                {progress.toLocaleString()} / {achievement.requirement.toLocaleString()}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-3 mt-2 text-xs">
                            {achievement.goldReward > 0 && (
                              <span className="text-yellow-300">💰 +{achievement.goldReward}</span>
                            )}
                            {achievement.medReward > 0 && (
                              <span className="text-purple-300">💎 +{achievement.medReward} MED</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatCard({ icon, label, value }: { icon: React.ElementType | string; label: string; value: string }) {
  const Icon = typeof icon === 'string' ? null : icon;
  
  return (
    <div className="bg-amber-950/50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        {typeof icon === 'string' ? (
          <span className="text-lg">{icon}</span>
        ) : Icon ? (
          <Icon className="w-4 h-4 text-amber-400" />
        ) : null}
        <span className="text-amber-300 text-xs">{label}</span>
      </div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  );
}
