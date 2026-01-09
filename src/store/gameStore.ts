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
  { id: 1, cost: 50000, bonusPercent: 1, type: 'score' },
  { id: 2, cost: 200000, bonusPercent: 5, type: 'score' },
  { id: 3, cost: 350000, bonusPercent: 8, type: 'exp' },
  { id: 4, cost: 400000, bonusPercent: 15, type: 'score' },
  { id: 5, cost: 600000, bonusPercent: 20, type: 'score' },
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

// Get bonus per upgrade level (each +1 gives +2% extra bonus)
export function getShoeUpgradeBonus(upgradeLevel: number): number {
  return upgradeLevel * 2; // +2% per upgrade level
}

interface GameState {
  // User
  user: UserData;
  avatarId: number;
  
  // Equipment
  ownedShoes: string[];
  shoeUpgrades: ShoeUpgrade[]; // Track upgrade levels for each shoe
  
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

// NEW Ranking System - Extended for 15.000 levels
export function getRank(level: number): { name: string; icon: string; color: string } {
  if (level >= 14000) return { name: 'DIVINE RUNNER', icon: '🌟', color: 'divine' };
  if (level >= 12000) return { name: 'IMMORTAL RUNNER', icon: '💫', color: 'immortal' };
  if (level >= 10000) return { name: 'ETERNAL RUNNER', icon: '🔱', color: 'eternal' };
  if (level >= 8000) return { name: 'CELESTIAL RUNNER', icon: '☀️', color: 'celestial' };
  if (level >= 6000) return { name: 'TRANSCENDENT RUNNER', icon: '🌀', color: 'transcendent' };
  if (level >= 4000) return { name: 'LEGENDARY RUNNER', icon: '⚡', color: 'legendary' };
  if (level >= 2500) return { name: 'MYTHICAL RUNNER', icon: '✨', color: 'mythical' };
  if (level >= 1500) return { name: 'MYTHIC RUNNER', icon: '🔥', color: 'mythic' };
  if (level >= 800) return { name: 'EPIC RUNNER', icon: '💎', color: 'epic' };
  if (level >= 400) return { name: 'GRAN MASTER RUNNER', icon: '👑👑', color: 'grandmaster' };
  if (level >= 200) return { name: 'MASTER RUNNER', icon: '👑', color: 'master' };
  if (level >= 50) return { name: 'ELITE RUNNER', icon: '⭐', color: 'elite' };
  return { name: 'WARRIOR RUNNER', icon: '🥋', color: 'warrior' };
}

// Legacy getTier for compatibility
export function getTier(level: number): { name: string; icon: string; color: string } {
  return getRank(level);
}

// NEW Reputation System - Daily gains based on distance
export function getReputationForDistance(distanceKm: number): number {
  if (distanceKm >= 8) return 800;
  if (distanceKm >= 7) return 600;
  if (distanceKm >= 5) return 300;
  if (distanceKm >= 2) return 100;
  return 0;
}

// NEW Reputation Levels
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
        
        set({
          user: {
            ...state.user,
            skillPoints: state.user.skillPoints - 1,
            skillCoins: type === 'coins' ? state.user.skillCoins + 1 : state.user.skillCoins,
            skillScore: type === 'score' ? state.user.skillScore + 1 : state.user.skillScore,
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
        coinBonus: shoe.coinBonus + upgradeBonus,
        expBonus: shoe.expBonus + upgradeBonus,
      };
    },
  }));
