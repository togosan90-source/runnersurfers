import { create } from 'zustand';

export interface Boost {
  id: number;
  name: string;
  icon: string;
  color: string;
  duration: number; // minutes
  scoreBonus: number; // percentage
  cost: number; // coins
}

export interface Shoe {
  id: string;
  name: string;
  description: string;
  icon: string;
  coinBonus: number; // percentage
  expBonus: number; // percentage
  unlockLevel: number;
  maxLevel: number;
  price: number; // euros (0 = free)
}

export interface Run {
  id: string;
  date: string;
  distance: number;
  duration: number;
  avgSpeed: number;
  calories: number;
  scoreEarned: number;
  expEarned: number;
  coinsEarned: number;
  path: { lat: number; lng: number }[];
}

export interface DailyObjective {
  targetDistance: number;
  currentDistance: number;
  completed: boolean;
  reward: number;
}

// Daily Quest System
export interface DailyQuest {
  id: number;
  requiredKm: number;
  expPercent: number;
  coins: number;
  completed: boolean;
}

// Score Upgrade System
export interface ScoreUpgrade {
  id: number;
  cost: number;
  bonusPercent: number;
  type: 'score' | 'exp';
  requiredLevel: number;
  purchased: boolean;
}

export const DAILY_QUESTS: Omit<DailyQuest, 'completed'>[] = [
  { id: 1, requiredKm: 1, expPercent: 2, coins: 1000 },
  { id: 2, requiredKm: 2, expPercent: 3, coins: 2000 },
  { id: 3, requiredKm: 4, expPercent: 5, coins: 2300 },
  { id: 4, requiredKm: 5, expPercent: 8, coins: 2400 },
  { id: 5, requiredKm: 6, expPercent: 10, coins: 2500 },
  { id: 6, requiredKm: 7, expPercent: 12, coins: 2700 },
  { id: 7, requiredKm: 8, expPercent: 15, coins: 3000 },
  { id: 8, requiredKm: 9, expPercent: 18, coins: 3200 },
  { id: 9, requiredKm: 10, expPercent: 22, coins: 3500 },
  { id: 10, requiredKm: 12, expPercent: 25, coins: 4000 },
];

export const SCORE_UPGRADES: Omit<ScoreUpgrade, 'purchased'>[] = [
  { id: 1, cost: 100000, bonusPercent: 1, type: 'score', requiredLevel: 1 },
  { id: 2, cost: 300000, bonusPercent: 5, type: 'score', requiredLevel: 50 },
  { id: 3, cost: 1000000, bonusPercent: 10, type: 'score', requiredLevel: 150 },
  { id: 4, cost: 5000000, bonusPercent: 15, type: 'score', requiredLevel: 350 },
  { id: 5, cost: 15000000, bonusPercent: 50, type: 'score', requiredLevel: 650 },
];

interface ActiveBoost {
  boost: Boost;
  endTime: number;
}

export interface UserData {
  id: string;
  username: string;
  level: number;
  exp: number;
  totalScore: number;
  coins: number;
  equippedShoes: string;
  skillPoints: number;
  skillCoins: number; // skill points invested in coins
  skillScore: number; // skill points invested in score
  reputation: number;
  totalDistance: number;
  streakDays: number;
  lastRunDate: string | null;
}

// Shoe Upgrade System
export interface ShoeUpgrade {
  shoeId: string;
  level: number; // 0 = base, 1-10 = upgrade levels
}

// Success rates for shoe upgrades
export const SHOE_UPGRADE_SUCCESS_RATES: Record<number, number> = {
  1: 100,  // +0 → +1: 100%
  2: 100,  // +1 → +2: 100%
  3: 65,   // +2 → +3: 65%
  4: 60,   // +3 → +4: 60%
  5: 55,   // +4 → +5: 55%
  6: 50,   // +5 → +6: 50%
  7: 30,   // +6 → +7: 30%
  8: 8,    // +7 → +8: 8%
  9: 5,    // +8 → +9: 5%
  10: 2,   // +9 → +10: 2%
};

// Calculate upgrade cost based on level and player's coin earnings
export function getShoeUpgradeCost(level: number, targetLevel: number, shoeId: string): number {
  const shoe = SHOES.find(s => s.id === shoeId);
  if (!shoe) return 0;
  
  // Base costs scale with coin multiplier and target level
  const coinMultiplier = getCoinMultiplier(level);
  const baseCost = 5000; // Base cost at level 1
  
  // Cost increases exponentially with target upgrade level
  const levelMultipliers: Record<number, number> = {
    1: 1,       // 5k base
    2: 2,       // 10k base
    3: 5,       // 25k base
    4: 10,      // 50k base
    5: 25,      // 125k base
    6: 50,      // 250k base
    7: 150,     // 750k base
    8: 400,     // 2M base
    9: 1000,    // 5M base
    10: 3000,   // 15M base
  };
  
  const shoeMultiplier = shoe.coinBonus / 5; // Higher tier shoes cost more
  
  return Math.floor(baseCost * coinMultiplier * (levelMultipliers[targetLevel] || 1) * shoeMultiplier);
}

// Progressive bonus per upgrade level (coins and exp bonuses)
export const SHOE_UPGRADE_BONUSES: Record<number, { coinBonus: number; expBonus: number }> = {
  0: { coinBonus: 0, expBonus: 0 },
  1: { coinBonus: 2, expBonus: 2 },    // +1: 2% coins, 2% exp
  2: { coinBonus: 2, expBonus: 2 },    // +2: 2% coins, 2% exp
  3: { coinBonus: 3, expBonus: 3 },    // +3: 3% coins, 3% exp
  4: { coinBonus: 4, expBonus: 4 },    // +4: 4% coins, 4% exp
  5: { coinBonus: 5, expBonus: 5 },    // +5: 5% coins, 5% exp
  6: { coinBonus: 6, expBonus: 6 },    // +6: 6% coins, 6% exp
  7: { coinBonus: 8, expBonus: 8 },    // +7: 8% coins, 8% exp
  8: { coinBonus: 10, expBonus: 10 },  // +8: 10% coins, 10% exp
  9: { coinBonus: 12, expBonus: 12 },  // +9: 12% coins, 12% exp
  10: { coinBonus: 15, expBonus: 15 }, // +10: 15% coins, 15% exp
};

// Get cumulative bonus for upgrade level
export function getShoeUpgradeBonus(upgradeLevel: number): { coinBonus: number; expBonus: number } {
  let totalCoinBonus = 0;
  let totalExpBonus = 0;
  
  for (let i = 1; i <= upgradeLevel; i++) {
    const bonus = SHOE_UPGRADE_BONUSES[i] || { coinBonus: 0, expBonus: 0 };
    totalCoinBonus += bonus.coinBonus;
    totalExpBonus += bonus.expBonus;
  }
  
  return { coinBonus: totalCoinBonus, expBonus: totalExpBonus };
}

interface GameState {
  // User
  user: UserData;
  avatarId: number;
  
  // Equipment
  ownedShoes: string[];
  shoeUpgrades: ShoeUpgrade[]; // Track upgrade levels for each shoe
  
  // Score Upgrade Level (permanent +1 to +10 system)
  scoreUpgradeLevel: number;
  
  // Boosts
  activeBoost: ActiveBoost | null;
  
  // Running
  isRunning: boolean;
  currentRun: {
    startTime: number;
    distance: number;
    positions: { lat: number; lng: number; timestamp: number }[];
    score: number;
    speed: number;
    expEarned: number;
    coinsEarned: number;
  } | null;
  
  // History
  runs: Run[];
  
  // Daily
  dailyObjective: DailyObjective;
  streak: number;
  
  // Daily Quests
  dailyQuests: DailyQuest[];
  dailyQuestsDate: string; // ISO date string to track reset
  dailyQuestsTotalDistance: number;
  
  // Score Upgrades
  purchasedUpgrades: number[]; // IDs of purchased upgrades
  
  // Actions
  setUser: (user: Partial<UserData>) => void;
  addExp: (amount: number) => void;
  addCoins: (amount: number) => void;
  addScore: (amount: number) => void;
  addReputation: (amount: number) => void;
  addSkillPoint: (type: 'coins' | 'score') => void;
  startRun: () => void;
  updateRun: (distance: number, lat: number, lng: number, score: number, speed: number) => void;
  endRun: () => Run | null;
  purchaseBoost: (boost: Boost) => boolean;
  activateBoost: (boost: Boost) => void;
  deactivateBoost: () => void;
  purchaseShoe: (shoeId: string) => boolean;
  equipShoe: (shoeId: string) => void;
  resetDailyObjective: () => void;
  updateStreak: () => void;
  // Daily Quests Actions
  checkAndResetDailyQuests: () => void;
  updateDailyQuestsProgress: (distanceKm: number) => { expEarned: number; coinsEarned: number; questsCompleted: number };
  // Upgrade Actions
  purchaseUpgrade: (upgradeId: number) => boolean;
  getTotalScoreBonus: () => number;
  getTotalExpBonus: () => number;
  
  // Shoe Upgrade Actions
  getShoeUpgradeLevel: (shoeId: string) => number;
  attemptShoeUpgrade: (shoeId: string) => { success: boolean; newLevel: number; cost: number };
  getTotalShoeBonus: () => { coinBonus: number; expBonus: number };
  
  // Score Upgrade Actions
  attemptScoreUpgrade: () => { success: boolean; newLevel: number; cost: number };
}

// NEW Boosts - Premium System (Levels 1-50)
export const BOOSTS: Boost[] = [
  { id: 1, name: 'Sprint', icon: '🟡', color: 'yellow', duration: 25, scoreBonus: 5, cost: 1000 },
  { id: 2, name: 'Velocity', icon: '🟢', color: 'green', duration: 25, scoreBonus: 15, cost: 5000 },
  { id: 3, name: 'Turbo', icon: '🔵', color: 'blue', duration: 45, scoreBonus: 30, cost: 10000 },
  { id: 4, name: 'Power', icon: '🟣', color: 'purple', duration: 50, scoreBonus: 50, cost: 15000 },
  { id: 5, name: 'Flame', icon: '🟠', color: 'orange', duration: 55, scoreBonus: 65, cost: 25000 },
  { id: 6, name: 'Earth', icon: '🟤', color: 'brown', duration: 60, scoreBonus: 70, cost: 30000 },
  { id: 7, name: 'Water', icon: '💙', color: 'cyan', duration: 60, scoreBonus: 100, cost: 50000 },
  { id: 8, name: 'Wind', icon: '💚', color: 'lime', duration: 80, scoreBonus: 250, cost: 150000 },
  { id: 9, name: 'Ultimate', icon: '🌟', color: 'legendary', duration: 100, scoreBonus: 300, cost: 250000 },
];

// NEW Shoes - Permanent Items (Real Money)
export const SHOES: Shoe[] = [
  {
    id: 'avalon',
    name: 'Scarpe Blu Avalon',
    description: 'Scarpe base per ogni runner',
    icon: '👟',
    coinBonus: 5,
    expBonus: 5,
    unlockLevel: 1,
    maxLevel: 150,
    price: 1,
  },
  {
    id: 'zeus',
    name: 'Scarpe Zeus del Fulmine',
    description: 'Potenza del fulmine ai tuoi piedi',
    icon: '⚡',
    coinBonus: 15,
    expBonus: 15,
    unlockLevel: 150,
    maxLevel: 300,
    price: 2,
  },
  {
    id: 'woodblas',
    name: 'Scarpe Verdi WoodBlas',
    description: 'La forza della natura ti accompagna',
    icon: '🌿',
    coinBonus: 30,
    expBonus: 30,
    unlockLevel: 300,
    maxLevel: 400,
    price: 3,
  },
  {
    id: 'energy',
    name: 'Scarpe Energy Power',
    description: 'Energia pura per il tuo corpo',
    icon: '⚡',
    coinBonus: 50,
    expBonus: 50,
    unlockLevel: 400,
    maxLevel: 500,
    price: 4,
  },
  {
    id: 'infinity',
    name: 'Scarpe Infinity Runner',
    description: 'I runner infiniti',
    icon: '♾️',
    coinBonus: 100,
    expBonus: 100,
    unlockLevel: 500,
    maxLevel: 600,
    price: 5,
  },
];

// NEW EXP System - Progressive scaling for 15.000 levels (~7.5 years target)
// The percentages are reduced at higher levels
export function getExpPerKm(level: number): number {
  if (level <= 100) return 20;   // 20% per km (levels 1-100) - 5 km to level up
  if (level <= 300) return 15;   // 15% per km (levels 101-300)
  if (level <= 600) return 12;   // 12% per km (levels 301-600)
  if (level <= 1000) return 10;  // 10% per km (levels 601-1000)
  if (level <= 2000) return 8;   // 8% per km (levels 1001-2000)
  if (level <= 4000) return 6;   // 6% per km (levels 2001-4000)
  if (level <= 7000) return 5;   // 5% per km (levels 4001-7000)
  if (level <= 10000) return 4;  // 4% per km (levels 7001-10000)
  if (level <= 13000) return 3;  // 3% per km (levels 10001-13000)
  return 2;                      // 2% per km (levels 13001-15000)
}

// EXP needed to level up (fixed at 100 for simplicity, represents 100%)
export function getExpNeeded(level: number): number {
  return 100; // 100 EXP = 100%
}

// NEW Coins System - Progressive earnings (extended for 15.000 levels)
// Base: 100 coins/100m = 800 coins/km, 3000 coins/5km, 5000 coins/level up
// Multiplier increases gradually with level

// Get coin multiplier based on level (starts at 1x, grows to ~20x at level 15000)
export function getCoinMultiplier(level: number): number {
  if (level <= 100) return 1 + (level - 1) * 0.01;           // 1.00x - 1.99x
  if (level <= 300) return 2 + (level - 100) * 0.015;        // 2.00x - 5.00x
  if (level <= 600) return 5 + (level - 300) * 0.02;         // 5.00x - 11.00x
  if (level <= 1000) return 11 + (level - 600) * 0.0125;     // 11.00x - 16.00x
  if (level <= 2000) return 16 + (level - 1000) * 0.01;      // 16.00x - 26.00x
  if (level <= 4000) return 26 + (level - 2000) * 0.0075;    // 26.00x - 41.00x
  if (level <= 7000) return 41 + (level - 4000) * 0.006;     // 41.00x - 59.00x
  if (level <= 10000) return 59 + (level - 7000) * 0.005;    // 59.00x - 74.00x
  if (level <= 13000) return 74 + (level - 10000) * 0.004;   // 74.00x - 86.00x
  return 86 + (level - 13000) * 0.003;                       // 86.00x - 92.00x at 15000
}

// Coins earned per 100 meters (base: 100 coins)
export function getCoinsPerHundredMeters(level: number): number {
  return Math.floor(100 * getCoinMultiplier(level));
}

// Coins earned per kilometer (base: 800 coins)
export function getCoinsPerKm(level: number): number {
  return Math.floor(800 * getCoinMultiplier(level));
}

// Coins earned per 5 kilometers (base: 3000 coins)
export function getCoinsPerFiveKm(level: number): number {
  return Math.floor(3000 * getCoinMultiplier(level));
}

// Coins earned per level up (base: 5000 coins)
export function getCoinsPerLevelUp(level: number): number {
  return Math.floor(5000 * getCoinMultiplier(level));
}

// NEW Ranking System - Level-based ranks with score bonuses
// Each rank covers 50 levels and gives +5% score bonus
export interface RankInfo {
  rank: number;
  name: string;
  icon: string;
  color: string;
  minLevel: number;
  maxLevel: number;
  scoreBonus: number; // percentage
}

// Generate all ranks from 1 to 300 (covering levels 1-15000)
export function getAllRanks(): RankInfo[] {
  const ranks: RankInfo[] = [];
  const rankNames = [
    { tier: 'Bronze', icon: '🥉', color: 'bronze' },
    { tier: 'Silver', icon: '🥈', color: 'silver' },
    { tier: 'Gold', icon: '🥇', color: 'gold' },
    { tier: 'Platinum', icon: '💠', color: 'platinum' },
    { tier: 'Diamond', icon: '💎', color: 'diamond' },
    { tier: 'Master', icon: '👑', color: 'master' },
    { tier: 'GrandMaster', icon: '👑👑', color: 'grandmaster' },
    { tier: 'Champion', icon: '🏆', color: 'champion' },
    { tier: 'Legend', icon: '⭐', color: 'legend' },
    { tier: 'Mythic', icon: '🔥', color: 'mythic' },
    { tier: 'Immortal', icon: '💫', color: 'immortal' },
    { tier: 'Divine', icon: '🌟', color: 'divine' },
  ];

  for (let i = 0; i < 300; i++) {
    const rankNum = i + 1;
    const tierIndex = Math.min(Math.floor(i / 25), rankNames.length - 1);
    const tierData = rankNames[tierIndex];
    const subRank = (i % 25) + 1;
    
    ranks.push({
      rank: rankNum,
      name: `${tierData.tier} ${subRank}`,
      icon: tierData.icon,
      color: tierData.color,
      minLevel: i * 50 + 1,
      maxLevel: (i + 1) * 50,
      scoreBonus: rankNum * 5, // Each rank gives +5% score bonus
    });
  }
  
  return ranks;
}

// Get current rank based on level
export function getRankByLevel(level: number): RankInfo {
  const rankIndex = Math.min(Math.floor((level - 1) / 50), 299);
  const ranks = getAllRanks();
  return ranks[rankIndex];
}

// Get score bonus percentage from rank
export function getRankScoreBonus(level: number): number {
  const rank = getRankByLevel(level);
  return rank.scoreBonus;
}

// Legacy getRank function for compatibility
export function getRank(level: number): { name: string; icon: string; color: string } {
  const rankInfo = getRankByLevel(level);
  return { name: rankInfo.name, icon: rankInfo.icon, color: rankInfo.color };
}

// Legacy getTier for compatibility
export function getTier(level: number): { name: string; icon: string; color: string } {
  return getRank(level);
}

// NEW Reputation System - Distance-based progression up to 15,000 km
// Each reputation tier requires more km to unlock, with score bonuses

export interface ReputationTier {
  level: number;
  name: string;
  icon: string;
  color: string;
  requiredKm: number;
  scoreBonus: number; // percentage bonus
}

// Generate all reputation tiers (progressive km requirements up to 15,000 km)
export function getAllReputationTiers(): ReputationTier[] {
  const tiers: ReputationTier[] = [
    { level: 1, name: 'Novizio', icon: '🌱', color: 'novice', requiredKm: 10, scoreBonus: 1 },
    { level: 2, name: 'Iniziato', icon: '🚶', color: 'novice', requiredKm: 20, scoreBonus: 2 },
    { level: 3, name: 'Avventuriero', icon: '🏃', color: 'novice', requiredKm: 50, scoreBonus: 3 },
    { level: 4, name: 'Combattente', icon: '⚔️', color: 'fighter', requiredKm: 100, scoreBonus: 4 },
    { level: 5, name: 'Veterano', icon: '🎖️', color: 'veteran', requiredKm: 150, scoreBonus: 5 },
    { level: 6, name: 'Esperto', icon: '📚', color: 'expert', requiredKm: 200, scoreBonus: 6 },
    { level: 7, name: 'Maestro', icon: '🎓', color: 'master', requiredKm: 300, scoreBonus: 7 },
    { level: 8, name: 'Campione', icon: '🏆', color: 'champion', requiredKm: 400, scoreBonus: 8 },
    { level: 9, name: 'Eroe', icon: '🦸', color: 'hero', requiredKm: 500, scoreBonus: 9 },
    { level: 10, name: 'Gladiatore', icon: '🛡️', color: 'gladiator', requiredKm: 650, scoreBonus: 10 },
    { level: 11, name: 'Conquistatore', icon: '👑', color: 'conqueror', requiredKm: 800, scoreBonus: 11 },
    { level: 12, name: 'Dominatore', icon: '⚡', color: 'dominator', requiredKm: 1000, scoreBonus: 12 },
    { level: 13, name: 'Leggenda', icon: '⭐', color: 'legend', requiredKm: 1250, scoreBonus: 13 },
    { level: 14, name: 'Mitico', icon: '🔥', color: 'mythic', requiredKm: 1500, scoreBonus: 14 },
    { level: 15, name: 'Immortale', icon: '💫', color: 'immortal', requiredKm: 1800, scoreBonus: 15 },
    { level: 16, name: 'Divino', icon: '🌟', color: 'divine', requiredKm: 2200, scoreBonus: 16 },
    { level: 17, name: 'Celestiale', icon: '✨', color: 'celestial', requiredKm: 2600, scoreBonus: 17 },
    { level: 18, name: 'Cosmico', icon: '🌌', color: 'cosmic', requiredKm: 3000, scoreBonus: 18 },
    { level: 19, name: 'Universale', icon: '🪐', color: 'universal', requiredKm: 3500, scoreBonus: 19 },
    { level: 20, name: 'Etereo', icon: '👻', color: 'ethereal', requiredKm: 4000, scoreBonus: 20 },
    { level: 21, name: 'Trascendente', icon: '🔮', color: 'transcendent', requiredKm: 4500, scoreBonus: 21 },
    { level: 22, name: 'Supremo', icon: '💎', color: 'supreme', requiredKm: 5000, scoreBonus: 22 },
    { level: 23, name: 'Assoluto', icon: '🏅', color: 'absolute', requiredKm: 5500, scoreBonus: 23 },
    { level: 24, name: 'Infinito', icon: '♾️', color: 'infinite', requiredKm: 6000, scoreBonus: 24 },
    { level: 25, name: 'Eterno', icon: '⏳', color: 'eternal', requiredKm: 6500, scoreBonus: 25 },
    { level: 26, name: 'Onnipotente', icon: '🌀', color: 'omnipotent', requiredKm: 7000, scoreBonus: 26 },
    { level: 27, name: 'Titanico', icon: '🗿', color: 'titanic', requiredKm: 7500, scoreBonus: 27 },
    { level: 28, name: 'Colossale', icon: '🏛️', color: 'colossal', requiredKm: 8000, scoreBonus: 28 },
    { level: 29, name: 'Monumentale', icon: '🗽', color: 'monumental', requiredKm: 8500, scoreBonus: 29 },
    { level: 30, name: 'Epico', icon: '📜', color: 'epic', requiredKm: 9000, scoreBonus: 30 },
    { level: 31, name: 'Fenomenale', icon: '💥', color: 'phenomenal', requiredKm: 9500, scoreBonus: 31 },
    { level: 32, name: 'Straordinario', icon: '🎭', color: 'extraordinary', requiredKm: 10000, scoreBonus: 32 },
    { level: 33, name: 'Incredibile', icon: '🎪', color: 'incredible', requiredKm: 10500, scoreBonus: 33 },
    { level: 34, name: 'Maestoso', icon: '🦁', color: 'majestic', requiredKm: 11000, scoreBonus: 34 },
    { level: 35, name: 'Glorioso', icon: '🌅', color: 'glorious', requiredKm: 11500, scoreBonus: 35 },
    { level: 36, name: 'Radioso', icon: '☀️', color: 'radiant', requiredKm: 12000, scoreBonus: 36 },
    { level: 37, name: 'Splendente', icon: '💡', color: 'shining', requiredKm: 12500, scoreBonus: 37 },
    { level: 38, name: 'Fulgido', icon: '🌞', color: 'bright', requiredKm: 13000, scoreBonus: 38 },
    { level: 39, name: 'Luminoso', icon: '🌈', color: 'luminous', requiredKm: 13500, scoreBonus: 39 },
    { level: 40, name: 'Abbagliante', icon: '⚜️', color: 'dazzling', requiredKm: 14000, scoreBonus: 40 },
    { level: 41, name: 'Ultra Leggendario', icon: '🏆⭐', color: 'ultralegend', requiredKm: 14500, scoreBonus: 42 },
    { level: 42, name: 'GOAT', icon: '🐐', color: 'goat', requiredKm: 15000, scoreBonus: 45 },
  ];
  
  return tiers;
}

// Get current reputation tier based on total distance
export function getReputationByDistance(totalDistanceKm: number): ReputationTier {
  const tiers = getAllReputationTiers();
  
  // Find the highest tier the user qualifies for
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (totalDistanceKm >= tiers[i].requiredKm) {
      return tiers[i];
    }
  }
  
  // Return "Nuovo" for users who haven't reached 10km yet
  return { level: 0, name: 'Nuovo', icon: '🌱', color: 'new', requiredKm: 0, scoreBonus: 0 };
}

// Get next reputation tier
export function getNextReputationTier(totalDistanceKm: number): ReputationTier | null {
  const tiers = getAllReputationTiers();
  
  for (const tier of tiers) {
    if (totalDistanceKm < tier.requiredKm) {
      return tier;
    }
  }
  
  return null; // Already at max tier
}

// Get reputation score bonus
export function getReputationScoreBonus(totalDistanceKm: number): number {
  const tier = getReputationByDistance(totalDistanceKm);
  return tier.scoreBonus;
}

// Legacy daily reputation gains (still used for daily tracking)
export function getReputationForDistance(distanceKm: number): number {
  if (distanceKm >= 8) return 800;
  if (distanceKm >= 7) return 600;
  if (distanceKm >= 5) return 300;
  if (distanceKm >= 2) return 100;
  return 0;
}

// Legacy reputation level function (for backward compatibility)
export function getReputationLevel(reputation: number): { name: string; level: number; color: string } {
  if (reputation >= 200000) return { name: 'Insane 4', level: 16, color: 'insane' };
  if (reputation >= 150000) return { name: 'Insane 3', level: 15, color: 'insane' };
  if (reputation >= 125000) return { name: 'Insane 2', level: 14, color: 'insane' };
  if (reputation >= 100000) return { name: 'Insane', level: 13, color: 'insane' };
  if (reputation >= 85000) return { name: 'Leggendario 3', level: 12, color: 'legendary' };
  if (reputation >= 65000) return { name: 'Leggendario 2', level: 11, color: 'legendary' };
  if (reputation >= 45000) return { name: 'Leggendario', level: 10, color: 'legendary' };
  if (reputation >= 40000) return { name: 'Veterano 3', level: 9, color: 'veteran' };
  if (reputation >= 35000) return { name: 'Veterano 2', level: 8, color: 'veteran' };
  if (reputation >= 22000) return { name: 'Veterano', level: 7, color: 'veteran' };
  if (reputation >= 18500) return { name: 'Esperto 3', level: 6, color: 'expert' };
  if (reputation >= 16500) return { name: 'Esperto 2', level: 5, color: 'expert' };
  if (reputation >= 15800) return { name: 'Esperto', level: 4, color: 'expert' };
  if (reputation >= 7500) return { name: 'Novizio 3', level: 3, color: 'novice' };
  if (reputation >= 5000) return { name: 'Novizio 2', level: 2, color: 'novice' };
  if (reputation >= 2000) return { name: 'Novizio', level: 1, color: 'novice' };
  return { name: 'Nuovo', level: 0, color: 'new' };
}

// Score multiplier based on level (legacy compatibility)
export function getScoreMultiplier(level: number): number {
  return 1.0 + (Math.floor(level / 5) * 0.005);
}

// EXP percentage per km based on level (legacy compatibility)
export function getExpPercentage(level: number): number {
  return getExpPerKm(level) / 100;
}

// Distance milestones for bonus coins
export function getMilestoneReward(totalDistanceKm: number): number {
  // Every 5km gives bonus coins (5km = 5 coins, 10km = 10 coins, etc.)
  const milestone = Math.floor(totalDistanceKm / 5) * 5;
  return milestone;
}

export function calculateCalories(distanceKm: number, weightKg: number = 70): number {
  return Math.floor(distanceKm * weightKg * 0.9);
}

// Calculate total shoe bonuses from all owned shoes
export function getTotalShoeBonus(ownedShoes: string[]): { coinBonus: number; expBonus: number } {
  let coinBonus = 0;
  let expBonus = 0;
  
  ownedShoes.forEach(shoeId => {
    const shoe = SHOES.find(s => s.id === shoeId);
    if (shoe) {
      coinBonus += shoe.coinBonus;
      expBonus += shoe.expBonus;
    }
  });
  
  return { coinBonus, expBonus };
}

export const useGameStore = create<GameState>()((set, get) => ({
      // Initial state
      user: {
        id: '',
        username: 'Runner',
        level: 1,
        exp: 0,
        totalScore: 0,
        coins: 50,
        equippedShoes: '',
        skillPoints: 0,
        skillCoins: 0,
        skillScore: 0,
        reputation: 0,
        totalDistance: 0,
        streakDays: 0,
        lastRunDate: null,
      },
      avatarId: 1,
      ownedShoes: [],
      activeBoost: null,
      isRunning: false,
      currentRun: null,
      runs: [],
      dailyObjective: {
        targetDistance: 5,
        currentDistance: 0,
        completed: false,
        reward: 50,
      },
      streak: 0,
      
      // Daily Quests
      dailyQuests: DAILY_QUESTS.map(q => ({ ...q, completed: false })),
      dailyQuestsDate: new Date().toISOString().split('T')[0],
      dailyQuestsTotalDistance: 0,
      
      // Score Upgrades
      purchasedUpgrades: [],
      
      // Shoe Upgrades
      shoeUpgrades: [],
      
      // Score Upgrade Level (permanent +1 to +10 system)
      scoreUpgradeLevel: 0,

      setUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData } 
      })),

      addExp: (amount) => {
        const state = get();
        let newExp = state.user.exp + amount;
        let newLevel = state.user.level;
        let newSkillPoints = state.user.skillPoints;

        while (newExp >= getExpNeeded(newLevel)) {
          newExp -= getExpNeeded(newLevel);
          newLevel++;
          newSkillPoints += 3; // 3 skill points per level
        }

        set({
          user: {
            ...state.user,
            exp: newExp,
            level: newLevel,
            skillPoints: newSkillPoints,
          }
        });
      },

      addCoins: (amount) => set((state) => ({ 
        user: { ...state.user, coins: state.user.coins + amount } 
      })),

      addScore: (amount) => set((state) => ({ 
        user: { ...state.user, totalScore: state.user.totalScore + amount } 
      })),

      addReputation: (amount) => set((state) => ({
        user: { ...state.user, reputation: state.user.reputation + amount }
      })),

      addSkillPoint: (type) => {
        const state = get();
        if (state.user.skillPoints <= 0) return;
        
        const increment = 0.05; // Each skill point adds 0.05%
        
        set({
          user: {
            ...state.user,
            skillPoints: state.user.skillPoints - 1,
            skillCoins: type === 'coins' ? Number((state.user.skillCoins + increment).toFixed(2)) : state.user.skillCoins,
            skillScore: type === 'score' ? Number((state.user.skillScore + increment).toFixed(2)) : state.user.skillScore,
          }
        });
      },

      startRun: () => set({
        isRunning: true,
        currentRun: {
          startTime: Date.now(),
          distance: 0,
          positions: [],
          score: 0,
          speed: 0,
          expEarned: 0,
          coinsEarned: 0,
        },
      }),

      updateRun: (distance, lat, lng, score, speed) => set((state) => {
        if (!state.currentRun) return state;
        return {
          currentRun: {
            ...state.currentRun,
            distance,
            score,
            speed,
            positions: [...state.currentRun.positions, { lat, lng, timestamp: Date.now() }],
          },
        };
      }),

      endRun: () => {
        const state = get();
        if (!state.currentRun) return null;

        const duration = (Date.now() - state.currentRun.startTime) / 1000;
        const avgSpeed = state.currentRun.distance > 0 ? (state.currentRun.distance / (duration / 3600)) : 0;
        const calories = calculateCalories(state.currentRun.distance);
        
        const run: Run = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          distance: state.currentRun.distance,
          duration,
          avgSpeed,
          calories,
          scoreEarned: state.currentRun.score,
          expEarned: state.currentRun.expEarned,
          coinsEarned: state.currentRun.coinsEarned,
          path: state.currentRun.positions.map(p => ({ lat: p.lat, lng: p.lng })),
        };

        const newTotalDistance = state.user.totalDistance + run.distance;
        const today = new Date().toISOString().split('T')[0];

        set((s) => ({
          isRunning: false,
          currentRun: null,
          runs: [...s.runs, run],
          user: {
            ...s.user,
            totalDistance: newTotalDistance,
            lastRunDate: today,
          },
          dailyObjective: {
            ...s.dailyObjective,
            currentDistance: s.dailyObjective.currentDistance + run.distance,
            completed: s.dailyObjective.currentDistance + run.distance >= s.dailyObjective.targetDistance,
          },
        }));

        return run;
      },

      purchaseBoost: (boost) => {
        const state = get();
        if (state.user.coins < boost.cost) return false;
        set({ user: { ...state.user, coins: state.user.coins - boost.cost } });
        return true;
      },

      activateBoost: (boost) => set({
        activeBoost: {
          boost,
          endTime: Date.now() + boost.duration * 60 * 1000,
        },
      }),

      deactivateBoost: () => set({ activeBoost: null }),

      purchaseShoe: (shoeId) => {
        const state = get();
        const shoe = SHOES.find(s => s.id === shoeId);
        if (!shoe || state.ownedShoes.includes(shoeId)) return false;
        // For real purchases, this would integrate with Stripe
        set((s) => ({
          ownedShoes: [...s.ownedShoes, shoeId],
        }));
        return true;
      },

      equipShoe: (shoeId) => {
        const state = get();
        if (state.ownedShoes.includes(shoeId)) {
          set({ user: { ...state.user, equippedShoes: shoeId } });
        }
      },

      resetDailyObjective: () => set({
        dailyObjective: {
          targetDistance: 5,
          currentDistance: 0,
          completed: false,
          reward: 50,
        },
      }),

      updateStreak: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const lastRun = state.user.lastRunDate;
        
        if (!lastRun) {
          set({ user: { ...state.user, streakDays: 1, lastRunDate: today } });
          return;
        }

        const lastDate = new Date(lastRun);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          set({ user: { ...state.user, streakDays: state.user.streakDays + 1, lastRunDate: today } });
        } else if (diffDays > 1) {
          set({ user: { ...state.user, streakDays: 1, lastRunDate: today } });
        }
      },
      
      // Daily Quests Actions
      checkAndResetDailyQuests: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (state.dailyQuestsDate !== today) {
          set({
            dailyQuests: DAILY_QUESTS.map(q => ({ ...q, completed: false })),
            dailyQuestsDate: today,
            dailyQuestsTotalDistance: 0,
          });
        }
      },
      
      updateDailyQuestsProgress: (distanceKm: number) => {
        const state = get();
        let expEarned = 0;
        let coinsEarned = 0;
        let questsCompleted = 0;
        
        const newTotalDistance = state.dailyQuestsTotalDistance + distanceKm;
        
        const updatedQuests = state.dailyQuests.map(quest => {
          if (!quest.completed && newTotalDistance >= quest.requiredKm) {
            expEarned += quest.expPercent;
            coinsEarned += quest.coins;
            questsCompleted++;
            return { ...quest, completed: true };
          }
          return quest;
        });
        
        set({
          dailyQuests: updatedQuests,
          dailyQuestsTotalDistance: newTotalDistance,
        });
        
        return { expEarned, coinsEarned, questsCompleted };
      },
      
      // Upgrade Actions
      purchaseUpgrade: (upgradeId: number) => {
        const state = get();
        const upgrade = SCORE_UPGRADES.find(u => u.id === upgradeId);
        
        if (!upgrade) return false;
        if (state.purchasedUpgrades.includes(upgradeId)) return false;
        if (state.user.coins < upgrade.cost) return false;
        if (state.user.level < upgrade.requiredLevel) return false;
        
        set({
          user: { ...state.user, coins: state.user.coins - upgrade.cost },
          purchasedUpgrades: [...state.purchasedUpgrades, upgradeId],
        });
        
        return true;
      },
      
      getTotalScoreBonus: () => {
        const state = get();
        return state.purchasedUpgrades.reduce((total, id) => {
          const upgrade = SCORE_UPGRADES.find(u => u.id === id);
          if (upgrade && upgrade.type === 'score') {
            return total + upgrade.bonusPercent;
          }
          return total;
        }, 0);
      },
      
    getTotalExpBonus: () => {
      const state = get();
      return state.purchasedUpgrades.reduce((total, id) => {
        const upgrade = SCORE_UPGRADES.find(u => u.id === id);
        if (upgrade && upgrade.type === 'exp') {
          return total + upgrade.bonusPercent;
        }
        return total;
      }, 0);
    },
    
    // Shoe Upgrade Actions
    getShoeUpgradeLevel: (shoeId: string) => {
      const state = get();
      const upgrade = state.shoeUpgrades.find(u => u.shoeId === shoeId);
      return upgrade?.level || 0;
    },
    
    attemptShoeUpgrade: (shoeId: string) => {
      const state = get();
      const currentLevel = state.shoeUpgrades.find(u => u.shoeId === shoeId)?.level || 0;
      const targetLevel = currentLevel + 1;
      
      if (targetLevel > 10) {
        return { success: false, newLevel: currentLevel, cost: 0 };
      }
      
      const cost = getShoeUpgradeCost(state.user.level, targetLevel, shoeId);
      
      if (state.user.coins < cost) {
        return { success: false, newLevel: currentLevel, cost };
      }
      
      // Deduct coins
      set({ user: { ...state.user, coins: state.user.coins - cost } });
      
      // Check success rate
      const successRate = SHOE_UPGRADE_SUCCESS_RATES[targetLevel] || 0;
      const roll = Math.random() * 100;
      const success = roll < successRate;
      
      if (success) {
        const existingIndex = state.shoeUpgrades.findIndex(u => u.shoeId === shoeId);
        if (existingIndex >= 0) {
          const newUpgrades = [...state.shoeUpgrades];
          newUpgrades[existingIndex] = { shoeId, level: targetLevel };
          set({ shoeUpgrades: newUpgrades });
        } else {
          set({ shoeUpgrades: [...state.shoeUpgrades, { shoeId, level: targetLevel }] });
        }
        return { success: true, newLevel: targetLevel, cost };
      }
      
      return { success: false, newLevel: currentLevel, cost };
    },
    
    getTotalShoeBonus: () => {
      const state = get();
      const equippedShoeId = state.user.equippedShoes;
      const shoe = SHOES.find(s => s.id === equippedShoeId);
      const upgradeLevel = state.shoeUpgrades.find(u => u.shoeId === equippedShoeId)?.level || 0;
      
      if (!shoe) return { coinBonus: 0, expBonus: 0 };
      
      const upgradeBonus = getShoeUpgradeBonus(upgradeLevel);
      
      return {
      coinBonus: shoe.coinBonus + upgradeBonus.coinBonus,
        expBonus: shoe.expBonus + upgradeBonus.expBonus,
      };
    },
    
    // Score Upgrade Actions (+1 to +10 permanent system)
    attemptScoreUpgrade: () => {
      const state = get();
      const currentLevel = state.scoreUpgradeLevel;
      const targetLevel = currentLevel + 1;
      
      if (targetLevel > 10) {
        return { success: false, newLevel: currentLevel, cost: 0 };
      }
      
      // Success rates for score upgrades (same as shoe upgrades)
      const successRates: Record<number, number> = {
        1: 100, 2: 100, 3: 65, 4: 60, 5: 55,
        6: 50, 7: 30, 8: 8, 9: 5, 10: 2,
      };
      
      // Cost calculation
      const baseCost = 5000;
      const coinMultiplier = 1 + (state.user.level - 1) * 0.01;
      const levelMultipliers: Record<number, number> = {
        1: 1, 2: 2, 3: 5, 4: 10, 5: 25,
        6: 50, 7: 150, 8: 400, 9: 1000, 10: 3000,
      };
      const cost = Math.floor(baseCost * coinMultiplier * (levelMultipliers[targetLevel] || 1));
      
      if (state.user.coins < cost) {
        return { success: false, newLevel: currentLevel, cost };
      }
      
      // Deduct coins
      set({ user: { ...state.user, coins: state.user.coins - cost } });
      
      // Check success rate
      const successRate = successRates[targetLevel] || 0;
      const roll = Math.random() * 100;
      const success = roll < successRate;
      
      if (success) {
        set({ scoreUpgradeLevel: targetLevel });
        return { success: true, newLevel: targetLevel, cost };
      }
      
      return { success: false, newLevel: currentLevel, cost };
    },
  }));
