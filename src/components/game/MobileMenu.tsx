'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { LEVELS, WEAPONS, ACHIEVEMENTS, GAME_CONFIG } from '@/types/game';
import { 
  X, 
  Menu, 
  Trophy, 
  Coins, 
  Zap, 
  Star, 
  Package, 
  ShoppingBag, 
  Award, 
  TrendingUp,
  Volume2,
  VolumeX,
  HelpCircle,
  RefreshCw,
  User,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundManager } from '@/lib/game/sounds';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenExchange: () => void;
  onOpenTutorial: () => void;
  onRestart: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

type TabType = 'stats' | 'inventory' | 'shop' | 'achievements';

export function MobileMenu({ 
  isOpen, 
  onClose,
  onOpenProfile,
  onOpenExchange,
  onOpenTutorial,
  onRestart,
  soundEnabled,
  toggleSound,
}: MobileMenuProps) {
  const { player, inventory, spendGold, addToInventory } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  if (!player) return null;

  const currentLevel = LEVELS.find(
    (l, i) => (LEVELS[i + 1]?.requiredNectar ?? Infinity) > player.totalNectar
  ) || LEVELS[0];

  const handleBuyWeapon = (weaponId: string) => {
    const weapon = WEAPONS.find(w => w.id === weaponId);
    if (!weapon) return;
    
    if (player.gold >= weapon.goldPrice) {
      if (spendGold(weapon.goldPrice)) {
        addToInventory(weapon, 1);
        soundManager.playPurchase();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Затемнение */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          
          {/* Выдвижное меню */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 z-50 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Шапка меню */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Menu className="w-5 h-5" />
                  Меню
                </h2>
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Балансы в одну строку */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 bg-amber-900/30 rounded-full px-2 py-1">
                  <span>🍯</span>
                  <span className="text-white font-medium">{player.nectar.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-900/30 rounded-full px-2 py-1">
                  <span>💰</span>
                  <span className="text-yellow-300 font-medium">{player.gold}</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-900/30 rounded-full px-2 py-1">
                  <span>💎</span>
                  <span className="text-purple-300 font-medium">{player.medBalance.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="p-3 border-b border-amber-600/30">
              <div className="grid grid-cols-4 gap-2">
                <QuickButton
                  icon={Coins}
                  label="Обмен"
                  onClick={() => { onOpenExchange(); onClose(); }}
                  gradient="from-purple-500 to-pink-500"
                />
                <QuickButton
                  icon={RefreshCw}
                  label="Заново"
                  onClick={() => { onRestart(); onClose(); }}
                />
                <QuickButton
                  icon={soundEnabled ? Volume2 : VolumeX}
                  label={soundEnabled ? 'Звук' : 'Выкл'}
                  onClick={toggleSound}
                />
                <QuickButton
                  icon={HelpCircle}
                  label="Помощь"
                  onClick={() => { onOpenTutorial(); onClose(); }}
                />
              </div>
            </div>

            {/* Табы */}
            <div className="flex border-b border-amber-600/30">
              {[
                { id: 'stats' as TabType, icon: TrendingUp },
                { id: 'inventory' as TabType, icon: Package },
                { id: 'shop' as TabType, icon: ShoppingBag },
                { id: 'achievements' as TabType, icon: Award },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 transition-all ${
                    activeTab === tab.id
                      ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-900/20'
                      : 'text-amber-100/60'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mx-auto" />
                </button>
              ))}
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'stats' && (
                <div className="space-y-2">
                  <StatRow icon={Trophy} label="Очки" value={player.totalScore.toLocaleString()} />
                  <StatRow icon="🍯" label="Нектар" value={player.totalNectar.toLocaleString()} />
                  <StatRow icon="🎮" label="Игр" value={player.gamesPlayed.toString()} />
                  <StatRow icon="🔥" label="Макс. комбо" value={`x${player.maxCombo}`} />
                  <StatRow icon="💫" label="Матчей" value={player.matchesMade.toLocaleString()} />
                  <StatRow icon="💎" label="Бонусов" value={player.bonusesCollected.toString()} />
                  
                  <div className="mt-4 bg-amber-950/50 rounded-xl p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-amber-300">Уровень {currentLevel.level}</span>
                      <span className="text-amber-400">{currentLevel.name}</span>
                    </div>
                    <div className="h-2 bg-amber-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
                        style={{ 
                          width: `${Math.min(100, ((player.totalNectar / (LEVELS[currentLevel.level]?.requiredNectar || player.totalNectar + 1)) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-2">
                  {inventory.length === 0 ? (
                    <div className="text-center py-6 text-amber-300/60">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Инвентарь пуст</p>
                    </div>
                  ) : (
                    inventory.map((item) => (
                      <div key={item.id} className="bg-amber-950/50 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-2xl">{item.weapon.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{item.weapon.name}</div>
                          <div className="text-amber-300/70 text-xs truncate">{item.weapon.description}</div>
                        </div>
                        <span className="bg-amber-600/30 rounded-lg px-2 py-1 text-amber-100 text-sm font-bold">
                          x{item.quantity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'shop' && (
                <div className="space-y-2">
                  <div className="text-center text-amber-300 text-sm mb-3">
                    Ваше золото: <span className="text-yellow-300 font-bold">{player.gold}</span> 💰
                  </div>
                  
                  {WEAPONS.map((weapon) => {
                    const canBuy = player.gold >= weapon.goldPrice && player.level >= weapon.minLevel;
                    
                    return (
                      <div 
                        key={weapon.id} 
                        className={`bg-amber-950/50 rounded-xl p-3 ${!canBuy && 'opacity-60'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{weapon.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium">{weapon.name}</div>
                            <div className="text-amber-300/70 text-xs">{weapon.description}</div>
                          </div>
                          <button
                            onClick={() => handleBuyWeapon(weapon.id)}
                            disabled={!canBuy}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              canBuy
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900'
                                : 'bg-gray-600 text-gray-400'
                            }`}
                          >
                            💰{weapon.goldPrice}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-2">
                  {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = player.achievements?.some(a => a.achievementId === achievement.id);
                    
                    return (
                      <div 
                        key={achievement.id}
                        className={`bg-amber-950/50 rounded-xl p-3 flex items-center gap-3 ${
                          !isUnlocked && 'opacity-70'
                        }`}
                      >
                        <span className={`text-2xl ${!isUnlocked && 'grayscale'}`}>
                          {achievement.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium">{achievement.name}</div>
                          <div className="text-amber-300/70 text-xs">{achievement.description}</div>
                        </div>
                        {isUnlocked && <span className="text-green-400">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function QuickButton({ 
  icon: Icon, 
  label, 
  onClick, 
  gradient 
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick: () => void;
  gradient?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 ${
        gradient 
          ? `bg-gradient-to-r ${gradient} text-white`
          : 'bg-amber-950/50 text-amber-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

function StatRow({ icon, label, value }: { icon: React.ElementType | string; label: string; value: string }) {
  const Icon = typeof icon === 'string' ? null : icon;
  
  return (
    <div className="flex items-center justify-between bg-amber-950/30 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        {typeof icon === 'string' ? (
          <span className="text-lg">{icon}</span>
        ) : Icon ? (
          <Icon className="w-4 h-4 text-amber-400" />
        ) : null}
        <span className="text-amber-300 text-sm">{label}</span>
      </div>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
