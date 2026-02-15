'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialProps {
  isOpen: boolean;
  onClose: (dontShowAgain?: boolean) => void;
}

const tutorialSteps = [
  {
    title: 'Добро пожаловать в Honey! 🐝',
    content: 'Помогите пчёлкам собирать нектар! Меняйте местами соседние элементы, чтобы собрать три или более одинаковых в ряд.',
    emoji: '🍯',
  },
  {
    title: 'Собирай нектар 🍯',
    content: 'Каждое совпадение приносит очки и нектар. Чем больше совпадений за один ход, тем больше нектара вы получите!',
    emoji: '🌸',
  },
  {
    title: 'Используй оружие ⚡',
    content: 'У вас есть мощное оружие! Молния уничтожает ряд, бомба взрывает область, а медовый горшочек убирает все ячейки одного типа.',
    emoji: '💣',
  },
  {
    title: 'Зарабатывай криптовалюту 💎',
    content: 'Накопите 10,000 нектара и обменяйте на реальные токены MED! Также во время игры могут выпасть крипто-бонусы!',
    emoji: '💰',
  },
];

export function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Закрываем туториал при нажатии Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(dontShowAgain);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, dontShowAgain]);

  if (!isOpen) return null;

  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => onClose(dontShowAgain)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-amber-600/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Индикаторы шагов */}
          <div className="flex justify-center gap-2 mb-6">
            {tutorialSteps.map((_, idx) => (
              <motion.div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'bg-amber-400 w-6' : 'bg-amber-600'
                }`}
                animate={idx === currentStep ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Контент */}
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              {tutorialSteps[currentStep].emoji}
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-3">
              {tutorialSteps[currentStep].title}
            </h3>
            <p className="text-amber-200 leading-relaxed">
              {tutorialSteps[currentStep].content}
            </p>
          </motion.div>

          {/* Кнопки навигации */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={isFirstStep}
              variant="outline"
              className="bg-amber-950/50 border-amber-600/30 text-amber-100 hover:bg-amber-950/70 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад
            </Button>

            {isLastStep ? (
              <Button
                onClick={() => onClose(dontShowAgain)}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-900 font-bold"
              >
                Начать играть!
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-900 font-bold"
              >
                Далее
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Кнопка пропуска */}
          {!isLastStep && (
            <button
              onClick={() => onClose(dontShowAgain)}
              className="w-full mt-4 text-amber-400 hover:text-amber-300 text-sm transition-colors"
            >
              Пропустить обучение
            </button>
          )}

          {/* Чекбокс "Не показывать снова" */}
          <label className="flex items-center justify-center gap-2 mt-4 cursor-pointer">
            <div 
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                dontShowAgain 
                  ? 'bg-amber-500 border-amber-500' 
                  : 'border-amber-400/50 bg-transparent'
              }`}
              onClick={() => setDontShowAgain(!dontShowAgain)}
            >
              {dontShowAgain && <Check className="w-3 h-3 text-amber-900" />}
            </div>
            <span className="text-amber-300 text-sm">Не показывать снова</span>
          </label>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
