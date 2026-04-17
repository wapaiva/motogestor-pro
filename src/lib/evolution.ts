import type { Ride, FuelEntry, MaintenanceEntry, Expense } from "./storage";

export interface PeriodTotals {
  earnings: number;
  expenses: number;
  profit: number;
  rides: number;
  distance: number;
}

export interface Comparison {
  current: PeriodTotals;
  previous: PeriodTotals;
  variation: {
    earnings: number; // percentage
    expenses: number;
    profit: number;
    rides: number;
    distance: number;
  };
}

function totalsBetween(
  rides: Ride[],
  fuel: FuelEntry[],
  maint: MaintenanceEntry[],
  exp: Expense[],
  start: Date,
  end: Date
): PeriodTotals {
  const inRange = (s: string) => {
    const d = new Date(s);
    return d >= start && d < end;
  };
  const r = rides.filter((x) => inRange(x.date));
  const earnings = r.reduce((s, x) => s + x.amount, 0);
  const distance = r.reduce((s, x) => s + x.distance, 0);
  const expenses =
    fuel.filter((x) => inRange(x.date)).reduce((s, x) => s + x.amount, 0) +
    maint.filter((x) => inRange(x.date)).reduce((s, x) => s + x.amount, 0) +
    exp.filter((x) => inRange(x.date)).reduce((s, x) => s + x.amount, 0);
  return {
    earnings,
    expenses,
    profit: earnings - expenses,
    rides: r.length,
    distance,
  };
}

function pct(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

function buildComparison(
  rides: Ride[],
  fuel: FuelEntry[],
  maint: MaintenanceEntry[],
  exp: Expense[],
  currStart: Date,
  currEnd: Date,
  prevStart: Date,
  prevEnd: Date
): Comparison {
  const current = totalsBetween(rides, fuel, maint, exp, currStart, currEnd);
  const previous = totalsBetween(rides, fuel, maint, exp, prevStart, prevEnd);
  return {
    current,
    previous,
    variation: {
      earnings: pct(current.earnings, previous.earnings),
      expenses: pct(current.expenses, previous.expenses),
      profit: pct(current.profit, previous.profit),
      rides: pct(current.rides, previous.rides),
      distance: pct(current.distance, previous.distance),
    },
  };
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date) {
  const x = startOfDay(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getEvolution(
  rides: Ride[],
  fuel: FuelEntry[],
  maint: MaintenanceEntry[],
  exp: Expense[]
) {
  const now = new Date();

  // Hoje vs Ontem
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const day = buildComparison(rides, fuel, maint, exp, todayStart, tomorrowStart, yesterdayStart, todayStart);

  // Semana atual vs anterior
  const weekStart = startOfWeek(now);
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const week = buildComparison(rides, fuel, maint, exp, weekStart, nextWeekStart, prevWeekStart, weekStart);

  // Mês atual vs anterior
  const monthStart = startOfMonth(now);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month = buildComparison(rides, fuel, maint, exp, monthStart, nextMonthStart, prevMonthStart, monthStart);

  return { day, week, month };
}

/** Last N days timeline for charts */
export function getDailyTimeline(
  rides: Ride[],
  fuel: FuelEntry[],
  maint: MaintenanceEntry[],
  exp: Expense[],
  days = 30
) {
  const out: { date: string; label: string; ganhos: number; gastos: number; lucro: number }[] = [];
  const now = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const t = totalsBetween(rides, fuel, maint, exp, d, next);
    out.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      ganhos: t.earnings,
      gastos: t.expenses,
      lucro: t.profit,
    });
  }
  return out;
}
