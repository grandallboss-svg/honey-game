// Типы элементов на игровом поле (пчелиная тематика)
export type GemType = 'honey' | 'flower' | 'bee' | 'comb' | 'sun' | 'water';

// Специальные элементы
export type SpecialType = 'normal' | 'bomb' | 'lightning' | 'rainbow';

// Типы оружия
export type WeaponType = 'lightning' | 'dynamite' | 'honeyblast' | 'beeswarm';

// Позиция на поле
export interface Position {
  row: number;
  col: number;
}

// Эффект оружия для отображения
export interface WeaponEffect {
  type: WeaponType;
  position: Position;
  cellSize?: number;
}

// Элемент на поле
export interface Gem {
  id: string;
  type: GemType;
  special: SpecialType;
  position: Position;
  isMatched: boolean;
  isNew: boolean;
  isFalling: boolean;
  bonusReward?: BonusReward;
}

// Награда бонуса
export interface BonusReward {
  type: 'crypto' | 'multiplier' | 'extra_moves' | 'gold' | 'weapon';
  amount?: number; // Количество MED токенов
  multiplier?: number;
  extraMoves?: number;
  goldAmount?: number;
  weaponType?: WeaponType;
}

// Матч (совпадение)
export interface Match {
  positions: Position[];
  type: GemType;
  length: number;
  isCombo: boolean;
}

// Свап элементов
export interface Swap {
  from: Position;
  to: Position;
}

// Оружие
export interface Weapon {
  id: string;
  name: string;
  description: string;
  type: WeaponType;
  icon: string;
  damage: number;
  radius: number;
  specialEffect?: string;
  goldPrice: number;
  medPrice: number;
  dropChance: number;
  minLevel: number;
}

// Предмет инвентаря
export interface InventoryItem {
  id: string;
  weaponId: string;
  weapon: Weapon;
  quantity: number;
}

// Достижение
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'games' | 'nectar' | 'combos' | 'weapons' | 'score';
  requirement: number;
  goldReward: number;
  medReward: number;
}

// Состояние игры
export interface GameState {
  board: (Gem | null)[][];
  score: number;
  nectar: number;
  moves: number;
  level: number;
  combo: number;
  maxCombo: number;
  isAnimating: boolean;
  gameOver: boolean;
  bonusActive: BonusReward | null;
  sessionStartTime: number;
  
  // Оружие
  selectedWeapon: Weapon | null;
  weaponMode: boolean;
  weaponEffect: WeaponEffect | null;
}

// Игрок
export interface Player {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  nectar: number;
  totalNectar: number;
  level: number;
  medBalance: number;
  totalWithdrawn: number;
  gold: number;
  gamesPlayed: number;
  matchesMade: number;
  combosHit: number;
  maxCombo: number;
  bonusesCollected: number;
  totalScore: number;
  inventory?: InventoryItem[];
  achievements?: PlayerAchievement[];
}

// Достижение игрока
export interface PlayerAchievement {
  id: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: Date;
}

// Конфигурация игры
export const GAME_CONFIG = {
  BOARD_WIDTH: 6,   // Ширина поля
  BOARD_HEIGHT: 8,  // Высота поля
  BOARD_SIZE: 6,    // Для обратной совместимости
  MIN_MATCH: 3,
  INITIAL_MOVES: 30,
  
  // Очки
  POINTS_PER_GEM: 10,
  POINTS_PER_COMBO: 50,
  COMBO_MULTIPLIER: 0.5,
  
  // Нектар
  NECTAR_PER_100_POINTS: 1,
  NECTAR_TO_MED: 10000, // 10000 нектара = 1 MED
  
  // Бонусы
  BOMB_MIN_MATCH: 4,
  LIGHTNING_MIN_MATCH: 5,
  
  // Шансы выпадения бонусов
  CRYPTO_BONUS_CHANCE: 0.01, // 1% шанс крипто-бонуса
  MULTIPLIER_BONUS_CHANCE: 0.05, // 5% шанс множителя
  GOLD_BONUS_CHANCE: 0.08, // 8% шанс золота
  WEAPON_BONUS_CHANCE: 0.03, // 3% шанс оружия
};

// Цвета элементов (более насыщенные и контрастные)
export const GEM_COLORS: Record<GemType, string> = {
  honey: '#E6A800',   // Тёмно-золотой
  flower: '#D946B8',  // Ярко-розовый
  bee: '#D4A500',     // Тёмно-жёлтый
  comb: '#B8860B',    // Тёмный золотистый
  sun: '#D4380D',     // Тёмно-оранжевый
  water: '#096DD9',   // Насыщенный синий
};

// Градиенты для элементов (более контрастные)
export const GEM_GRADIENTS: Record<GemType, string> = {
  honey: 'radial-gradient(circle at 30% 30%, #FFD54F 0%, #E6A800 50%, #8B6914 100%)',
  flower: 'radial-gradient(circle at 30% 30%, #F48FB1 0%, #D946B8 50%, #9C27B0 100%)',
  bee: 'radial-gradient(circle at 30% 30%, #FFE082 0%, #D4A500 50%, #8B6914 100%)',
  comb: 'radial-gradient(circle at 30% 30%, #D4B896 0%, #B8860B 50%, #6D4C41 100%)',
  sun: 'radial-gradient(circle at 30% 30%, #FF8A65 0%, #D4380D 50%, #BF360C 100%)',
  water: 'radial-gradient(circle at 30% 30%, #64B5F6 0%, #096DD9 50%, #0D47A1 100%)',
};

// Эмодзи для элементов
export const GEM_EMOJIS: Record<GemType, string> = {
  honey: '🍯',
  flower: '🌸',
  bee: '🐝',
  comb: '🔲',
  sun: '☀️',
  water: '💧',
};

// Уровни игры
export const LEVELS = [
  { level: 1, requiredNectar: 0, name: 'Рабочая пчела' },
  { level: 2, requiredNectar: 1000, name: 'Пчела-сборщица' },
  { level: 3, requiredNectar: 5000, name: 'Пчела-разведчик' },
  { level: 4, requiredNectar: 15000, name: 'Страж улья' },
  { level: 5, requiredNectar: 50000, name: 'Королевская пчела' },
  { level: 6, requiredNectar: 100000, name: 'Хранитель улья' },
  { level: 7, requiredNectar: 250000, name: 'Повелитель мёда' },
  { level: 8, requiredNectar: 500000, name: 'Легенда улья' },
];

// Стандартное оружие
export const WEAPONS: Weapon[] = [
  {
    id: 'lightning',
    name: 'Молния',
    description: 'Уничтожает ряд или колонку',
    type: 'lightning',
    icon: '⚡',
    damage: 8,
    radius: 1,
    goldPrice: 500,
    medPrice: 0,
    dropChance: 0.05,
    minLevel: 1,
  },
  {
    id: 'dynamite',
    name: 'Динамит',
    description: 'Взрыв 3x3 ячеек вокруг',
    type: 'dynamite',
    icon: '💣',
    damage: 9,
    radius: 1,
    goldPrice: 800,
    medPrice: 0,
    dropChance: 0.03,
    minLevel: 2,
  },
  {
    id: 'honeyblast',
    name: 'Медовый взрыв',
    description: 'Уничтожает все ячейки одного типа',
    type: 'honeyblast',
    icon: '🍯',
    damage: 20,
    radius: 0,
    specialEffect: 'destroyAllType',
    goldPrice: 1500,
    medPrice: 0,
    dropChance: 0.02,
    minLevel: 3,
  },
  {
    id: 'beeswarm',
    name: 'Рой пчёл',
    description: 'Случайно уничтожает 12 ячеек',
    type: 'beeswarm',
    icon: '🐝',
    damage: 12,
    radius: 0,
    specialEffect: 'random',
    goldPrice: 1000,
    medPrice: 0,
    dropChance: 0.025,
    minLevel: 2,
  },
];

// Достижения
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'games10', name: 'Начинающий', description: 'Сыграть 10 игр', icon: '🎮', type: 'games', requirement: 10, goldReward: 100, medReward: 0 },
  { id: 'games50', name: 'Опытный игрок', description: 'Сыграть 50 игр', icon: '🎯', type: 'games', requirement: 50, goldReward: 500, medReward: 0.01 },
  { id: 'games100', name: 'Ветеран', description: 'Сыграть 100 игр', icon: '🏆', type: 'games', requirement: 100, goldReward: 1000, medReward: 0.05 },
  { id: 'nectar10k', name: 'Собиратель', description: 'Собрать 10,000 нектара', icon: '🍯', type: 'nectar', requirement: 10000, goldReward: 200, medReward: 0 },
  { id: 'nectar100k', name: 'Медовик', description: 'Собрать 100,000 нектара', icon: '💎', type: 'nectar', requirement: 100000, goldReward: 1000, medReward: 0.1 },
  { id: 'combo5', name: 'Комбо мастер', description: 'Сделать комбо x5', icon: '🔥', type: 'combos', requirement: 5, goldReward: 300, medReward: 0 },
  { id: 'combo10', name: 'Комбо король', description: 'Сделать комбо x10', icon: '👑', type: 'combos', requirement: 10, goldReward: 800, medReward: 0.02 },
  { id: 'score100k', name: 'Счетовод', description: 'Набрать 100,000 очков', icon: '📊', type: 'score', requirement: 100000, goldReward: 500, medReward: 0 },
];
