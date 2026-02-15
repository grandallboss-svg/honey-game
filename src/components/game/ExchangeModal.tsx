'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONFIG } from '@/types/game';
import { X, Coins, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeModal({ isOpen, onClose }: ExchangeModalProps) {
  const { nectar, player, exchangeNectar } = useGameStore();
  const [amount, setAmount] = useState(GAME_CONFIG.NECTAR_TO_MED);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const maxExchange = Math.floor(nectar / GAME_CONFIG.NECTAR_TO_MED);
  const medAmount = amount / GAME_CONFIG.NECTAR_TO_MED;

  const handleExchange = async () => {
    if (amount > nectar || amount < GAME_CONFIG.NECTAR_TO_MED) return;

    setIsProcessing(true);
    
    try {
      // Вызываем API для обмена
      if (player?.telegramId) {
        const response = await fetch('/api/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramId: player.telegramId,
            nectarAmount: amount,
          }),
        });

        if (response.ok) {
          exchangeNectar();
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Exchange error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-amber-600/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center"
              >
                <Coins className="w-5 h-5 text-amber-900" />
              </motion.div>
              <h2 className="text-xl font-bold text-white">Обмен нектара</h2>
            </div>
            <button
              onClick={onClose}
              className="text-amber-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {success ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              </motion.div>
              <p className="text-white text-lg font-medium">
                Успешно обменяно!
              </p>
              <p className="text-amber-300 mt-2">
                +{medAmount.toFixed(4)} MED на ваш баланс
              </p>
            </motion.div>
          ) : (
            <>
              {/* Информация о курсе */}
              <div className="bg-amber-950/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-300">Курс обмена:</span>
                  <span className="text-white font-medium">
                    {GAME_CONFIG.NECTAR_TO_MED.toLocaleString()} нектара = 1 MED
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-amber-300">Ваш нектар:</span>
                  <span className="text-white font-medium">
                    🍯 {nectar.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-amber-300">Макс. обмен:</span>
                  <span className="text-green-400 font-medium">
                    {maxExchange} MED
                  </span>
                </div>
              </div>

              {/* Предустановленные суммы */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 5, 10].map((med) => {
                  const nectarNeeded = med * GAME_CONFIG.NECTAR_TO_MED;
                  const canExchange = nectar >= nectarNeeded;
                  return (
                    <button
                      key={med}
                      onClick={() => setAmount(nectarNeeded)}
                      disabled={!canExchange}
                      className={`p-3 rounded-xl text-center transition-all ${
                        canExchange
                          ? amount === nectarNeeded
                            ? 'bg-amber-500 text-amber-900'
                            : 'bg-amber-950/50 text-white hover:bg-amber-950/70'
                          : 'bg-amber-950/30 text-amber-600 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-lg font-bold">{med} MED</div>
                      <div className="text-xs opacity-70">
                        {(nectarNeeded).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Пользовательская сумма */}
              <div className="mb-4">
                <label className="text-amber-300 text-sm mb-2 block">
                  Или введите количество MED:
                </label>
                <input
                  type="number"
                  min={1}
                  max={maxExchange}
                  value={medAmount}
                  onChange={(e) => 
                    setAmount(Math.max(GAME_CONFIG.NECTAR_TO_MED, Number(e.target.value) * GAME_CONFIG.NECTAR_TO_MED))
                  }
                  className="w-full bg-amber-950/50 border border-amber-600/30 rounded-xl px-4 py-3 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Предупреждение */}
              {maxExchange === 0 && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">
                      Недостаточно нектара для обмена. Минимум: {GAME_CONFIG.NECTAR_TO_MED.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Итоговая сумма */}
              <div className="bg-gradient-to-r from-amber-600/30 to-amber-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-amber-200">Вы получите:</span>
                  <span className="text-2xl font-bold text-white">
                    {medAmount.toFixed(4)} MED
                  </span>
                </div>
              </div>

              {/* Кнопка обмена */}
              <Button
                onClick={handleExchange}
                disabled={maxExchange === 0 || isProcessing || amount > nectar}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-900 font-bold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.div>
                ) : (
                  `Обменять ${amount.toLocaleString()} нектара`
                )}
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
