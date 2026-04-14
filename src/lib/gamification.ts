import { storage } from "./storage";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: "corridas" | "ganhos" | "economia" | "dedicacao";
}

export interface GamificationData {
  xp: number;
  level: number;
  badges: Badge[];
  streakDays: number;
  lastActiveDate: string;
}

const BADGE_DEFINITIONS: Omit<Badge, "unlocked" | "unlockedAt">[] = [
  { id: "first_ride", name: "Primeira Corrida", description: "Registrou sua primeira corrida", icon: "🏍️", category: "corridas" },
  { id: "ride_10", name: "Esquentando Motor", description: "Complete 10 corridas", icon: "🔥", category: "corridas" },
  { id: "ride_50", name: "Piloto Experiente", description: "Complete 50 corridas", icon: "⭐", category: "corridas" },
  { id: "ride_100", name: "Lenda das Ruas", description: "Complete 100 corridas", icon: "🏆", category: "corridas" },
  { id: "ride_500", name: "Ás do Asfalto", description: "Complete 500 corridas", icon: "👑", category: "corridas" },
  { id: "earn_1k", name: "Primeiro Milhar", description: "Ganhe R$ 1.000 no total", icon: "💰", category: "ganhos" },
  { id: "earn_5k", name: "Conta Turbinada", description: "Ganhe R$ 5.000 no total", icon: "💎", category: "ganhos" },
  { id: "earn_10k", name: "Dez Mil!", description: "Ganhe R$ 10.000 no total", icon: "🚀", category: "ganhos" },
  { id: "earn_50k", name: "Magnata do Delivery", description: "Ganhe R$ 50.000 no total", icon: "🤑", category: "ganhos" },
  { id: "saver", name: "Econômico", description: "Mantenha gastos abaixo de 30% dos ganhos no mês", icon: "🐷", category: "economia" },
  { id: "profit_master", name: "Mestre do Lucro", description: "Atinja lucro de R$ 3.000 em um mês", icon: "📈", category: "economia" },
  { id: "streak_7", name: "Semana Firme", description: "Registre corridas por 7 dias seguidos", icon: "🔥", category: "dedicacao" },
  { id: "streak_30", name: "Mês Completo", description: "Registre corridas por 30 dias seguidos", icon: "💪", category: "dedicacao" },
  { id: "early_bird", name: "Madrugador", description: "Registre uma corrida antes das 7h", icon: "🌅", category: "dedicacao" },
  { id: "night_owl", name: "Coruja Noturna", description: "Registre uma corrida após as 22h", icon: "🦉", category: "dedicacao" },
];

const XP_PER_RIDE = 10;
const XP_PER_100_REAIS = 5;
const XP_PER_BADGE = 50;

function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXp(xp: number): number {
  let level = 1;
  let totalXp = 0;
  while (totalXp + getXpForLevel(level) <= xp) {
    totalXp += getXpForLevel(level);
    level++;
  }
  return level;
}

export function getXpProgress(xp: number): { current: number; needed: number; pct: number } {
  let level = 1;
  let totalXp = 0;
  while (totalXp + getXpForLevel(level) <= xp) {
    totalXp += getXpForLevel(level);
    level++;
  }
  const current = xp - totalXp;
  const needed = getXpForLevel(level);
  return { current, needed, pct: Math.min((current / needed) * 100, 100) };
}

export function getLevelTitle(level: number): string {
  if (level >= 30) return "Lenda Suprema";
  if (level >= 25) return "Mestre das Entregas";
  if (level >= 20) return "Velocista Elite";
  if (level >= 15) return "Piloto Veterano";
  if (level >= 10) return "Motoqueiro Experiente";
  if (level >= 7) return "Corredor Dedicado";
  if (level >= 5) return "Entregador Ativo";
  if (level >= 3) return "Motoboy Iniciante";
  return "Novato";
}

export function calculateGamification(): GamificationData {
  const rides = storage.getRides();
  const fuel = storage.getFuel();
  const maintenance = storage.getMaintenance();
  const expenses = storage.getExpenses();

  const totalEarnings = rides.reduce((s, r) => s + r.amount, 0);
  const totalFuel = fuel.reduce((s, f) => s + f.amount, 0);
  const totalMaint = maintenance.reduce((s, m) => s + m.amount, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalFuel + totalMaint + totalExp;

  // Calculate streak
  const rideDates = [...new Set(rides.map(r => new Date(r.date).toDateString()))].sort();
  let streakDays = 0;
  if (rideDates.length > 0) {
    streakDays = 1;
    const today = new Date().toDateString();
    const sortedDates = rideDates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    
    if (sortedDates[0].toDateString() === today || 
        sortedDates[0].toDateString() === new Date(Date.now() - 86400000).toDateString()) {
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const diff = (sortedDates[i].getTime() - sortedDates[i + 1].getTime()) / 86400000;
        if (Math.round(diff) === 1) streakDays++;
        else break;
      }
    } else {
      streakDays = 0;
    }
  }

  // Check monthly data
  const now = new Date();
  const monthRides = rides.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthEarnings = monthRides.reduce((s, r) => s + r.amount, 0);
  const monthExpenses = fuel.filter(f => {
    const d = new Date(f.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, f) => s + f.amount, 0) + 
  maintenance.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, m) => s + m.amount, 0) +
  expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + e.amount, 0);

  // Evaluate badges
  const badges: Badge[] = BADGE_DEFINITIONS.map(def => {
    let unlocked = false;

    switch (def.id) {
      case "first_ride": unlocked = rides.length >= 1; break;
      case "ride_10": unlocked = rides.length >= 10; break;
      case "ride_50": unlocked = rides.length >= 50; break;
      case "ride_100": unlocked = rides.length >= 100; break;
      case "ride_500": unlocked = rides.length >= 500; break;
      case "earn_1k": unlocked = totalEarnings >= 1000; break;
      case "earn_5k": unlocked = totalEarnings >= 5000; break;
      case "earn_10k": unlocked = totalEarnings >= 10000; break;
      case "earn_50k": unlocked = totalEarnings >= 50000; break;
      case "saver": unlocked = monthEarnings > 0 && monthExpenses / monthEarnings < 0.3; break;
      case "profit_master": unlocked = (monthEarnings - monthExpenses) >= 3000; break;
      case "streak_7": unlocked = streakDays >= 7; break;
      case "streak_30": unlocked = streakDays >= 30; break;
      case "early_bird": unlocked = rides.some(r => new Date(r.date).getHours() < 7); break;
      case "night_owl": unlocked = rides.some(r => new Date(r.date).getHours() >= 22); break;
    }

    return { ...def, unlocked, unlockedAt: unlocked ? new Date().toISOString() : undefined };
  });

  // Calculate XP
  let xp = rides.length * XP_PER_RIDE;
  xp += Math.floor(totalEarnings / 100) * XP_PER_100_REAIS;
  xp += badges.filter(b => b.unlocked).length * XP_PER_BADGE;

  const level = getLevelFromXp(xp);

  return {
    xp,
    level,
    badges,
    streakDays,
    lastActiveDate: rideDates[rideDates.length - 1] || "",
  };
}
