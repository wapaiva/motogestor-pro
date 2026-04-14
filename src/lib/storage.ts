export interface Ride {
  id: string;
  date: string;
  type: "mototaxi" | "entrega" | "corrida" | "passageiro" | "outro";
  amount: number;
  distance: number;
  platform: string;
  customSource?: string;
  notes?: string;
}

export interface FuelEntry {
  id: string;
  date: string;
  amount: number;
  liters: number;
  odometer: number;
  fuelType: "gasolina" | "etanol";
  station?: string;
}

export interface MaintenanceEntry {
  id: string;
  date: string;
  type: string;
  amount: number;
  odometer: number;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: "multa" | "seguro" | "documentacao" | "ipva" | "lavagem" | "alimentacao" | "outro";
  amount: number;
  description: string;
}

export interface UserProfile {
  name: string;
  city: string;
  serviceType: string;
  motoModel: string;
  motoYear: string;
  motoPlate: string;
  currentKm: number;
  expectedConsumption: number;
}

export interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  city: "",
  serviceType: "",
  motoModel: "",
  motoYear: "",
  motoPlate: "",
  currentKm: 0,
  expectedConsumption: 30,
};

const DEFAULT_GOALS: Goals = {
  daily: 200,
  weekly: 1200,
  monthly: 5000,
};

function get<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getRides: (): Ride[] => get("mg_rides", []),
  saveRides: (r: Ride[]) => set("mg_rides", r),
  addRide: (r: Ride) => {
    const all = storage.getRides();
    all.push(r);
    storage.saveRides(all);
  },
  deleteRide: (id: string) =>
    storage.saveRides(storage.getRides().filter((r) => r.id !== id)),

  getFuel: (): FuelEntry[] => get("mg_fuel", []),
  saveFuel: (f: FuelEntry[]) => set("mg_fuel", f),
  addFuel: (f: FuelEntry) => {
    const all = storage.getFuel();
    all.push(f);
    storage.saveFuel(all);
  },
  deleteFuel: (id: string) =>
    storage.saveFuel(storage.getFuel().filter((f) => f.id !== id)),

  getMaintenance: (): MaintenanceEntry[] => get("mg_maintenance", []),
  saveMaintenance: (m: MaintenanceEntry[]) => set("mg_maintenance", m),
  addMaintenance: (m: MaintenanceEntry) => {
    const all = storage.getMaintenance();
    all.push(m);
    storage.saveMaintenance(all);
  },
  deleteMaintenance: (id: string) =>
    storage.saveMaintenance(storage.getMaintenance().filter((m) => m.id !== id)),

  getExpenses: (): Expense[] => get("mg_expenses", []),
  saveExpenses: (e: Expense[]) => set("mg_expenses", e),
  addExpense: (e: Expense) => {
    const all = storage.getExpenses();
    all.push(e);
    storage.saveExpenses(all);
  },
  deleteExpense: (id: string) =>
    storage.saveExpenses(storage.getExpenses().filter((e) => e.id !== id)),

  getProfile: (): UserProfile => get("mg_profile", DEFAULT_PROFILE),
  saveProfile: (p: UserProfile) => set("mg_profile", p),

  getGoals: (): Goals => get("mg_goals", DEFAULT_GOALS),
  saveGoals: (g: Goals) => set("mg_goals", g),
};

export function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return d >= weekStart;
}

export function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
