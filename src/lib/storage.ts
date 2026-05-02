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

// === User-scoped storage ===
// Each authenticated user has its own keyspace: mg:<uid>:<key>
// Guests use mg:guest:<key>. The active uid is set via setActiveUser().
const ACTIVE_UID_KEY = "mg_active_uid";

function getActiveUid(): string {
  return localStorage.getItem(ACTIVE_UID_KEY) || "guest";
}

export function setActiveUser(uid: string | null) {
  const next = uid || "guest";
  const prev = getActiveUid();
  localStorage.setItem(ACTIVE_UID_KEY, next);
  if (prev !== next) {
    // Notify listeners so screens re-read scoped data
    window.dispatchEvent(new Event("mg:user-changed"));
  }
}

/** Wipe ALL scoped data for a given uid (used on logout to prevent leaks). */
export function clearUserScope(uid: string | null) {
  const target = uid || "guest";
  const prefix = `mg:${target}:`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) keysToRemove.push(k);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

function scopedKey(key: string): string {
  return `mg:${getActiveUid()}:${key}`;
}

function get<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(scopedKey(key));
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(scopedKey(key), JSON.stringify(value));
}

export const storage = {
  getRides: (): Ride[] => get("rides", []),
  saveRides: (r: Ride[]) => set("rides", r),
  addRide: (r: Ride) => {
    const all = storage.getRides();
    all.push(r);
    storage.saveRides(all);
  },
  deleteRide: (id: string) =>
    storage.saveRides(storage.getRides().filter((r) => r.id !== id)),

  getFuel: (): FuelEntry[] => get("fuel", []),
  saveFuel: (f: FuelEntry[]) => set("fuel", f),
  addFuel: (f: FuelEntry) => {
    const all = storage.getFuel();
    all.push(f);
    storage.saveFuel(all);
  },
  deleteFuel: (id: string) =>
    storage.saveFuel(storage.getFuel().filter((f) => f.id !== id)),

  getMaintenance: (): MaintenanceEntry[] => get("maintenance", []),
  saveMaintenance: (m: MaintenanceEntry[]) => set("maintenance", m),
  addMaintenance: (m: MaintenanceEntry) => {
    const all = storage.getMaintenance();
    all.push(m);
    storage.saveMaintenance(all);
  },
  deleteMaintenance: (id: string) =>
    storage.saveMaintenance(storage.getMaintenance().filter((m) => m.id !== id)),

  getExpenses: (): Expense[] => get("expenses", []),
  saveExpenses: (e: Expense[]) => set("expenses", e),
  addExpense: (e: Expense) => {
    const all = storage.getExpenses();
    all.push(e);
    storage.saveExpenses(all);
  },
  deleteExpense: (id: string) =>
    storage.saveExpenses(storage.getExpenses().filter((e) => e.id !== id)),

  getProfile: (): UserProfile => get("profile", DEFAULT_PROFILE),
  saveProfile: (p: UserProfile) => set("profile", p),

  getGoals: (): Goals => get("goals", DEFAULT_GOALS),
  saveGoals: (g: Goals) => set("goals", g),
};

// === One-time migration: legacy unscoped keys → active user scope ===
// Old keys (mg_rides, mg_fuel, ...) were shared across users on the device.
// On first call we move them under the active uid scope, then delete the
// legacy keys so subsequent users don't inherit them.
export function migrateLegacyKeysIntoActiveScope() {
  const legacy: Array<[string, string]> = [
    ["mg_rides", "rides"],
    ["mg_fuel", "fuel"],
    ["mg_maintenance", "maintenance"],
    ["mg_expenses", "expenses"],
    ["mg_profile", "profile"],
    ["mg_goals", "goals"],
  ];
  const uid = getActiveUid();
  for (const [oldKey, newKey] of legacy) {
    const raw = localStorage.getItem(oldKey);
    if (raw == null) continue;
    const scopedKey = `mg:${uid}:${newKey}`;
    if (localStorage.getItem(scopedKey) == null) {
      localStorage.setItem(scopedKey, raw);
    }
    localStorage.removeItem(oldKey);
  }
}

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

// === Fuel calculation utilities ===

/** Calculate fuel cost for a given distance */
export function calcularCustoCombustivel(distanciaKm: number, consumoKmL: number, precoCombustivel: number): number {
  if (consumoKmL <= 0) return 0;
  return (distanciaKm / consumoKmL) * precoCombustivel;
}

/** Calculate liters consumed for a given distance */
export function calcularLitrosGastos(distanciaKm: number, consumoKmL: number): number {
  if (consumoKmL <= 0) return 0;
  return distanciaKm / consumoKmL;
}

/** Calculate net profit after fuel cost */
export function calcularLucro(valorCorrida: number, custoCombustivel: number): number {
  return valorCorrida - custoCombustivel;
}

/** Get average fuel price from recent refueling entries */
export function getAvgFuelPrice(): number {
  const fuelEntries = storage.getFuel();
  if (fuelEntries.length === 0) return 0;
  const recent = [...fuelEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const totalPrice = recent.reduce((sum, f) => sum + (f.amount / f.liters), 0);
  return totalPrice / recent.length;
}

/** Check if moto consumption is properly configured */
export function isConsumptionConfigured(): boolean {
  const profile = storage.getProfile();
  return profile.expectedConsumption > 0;
}

// === Real consumption calculation ===

/** Calculate real consumption from two odometer readings and liters */
export function calcularConsumoReal(kmAtual: number, kmAnterior: number, litros: number): number {
  if (litros <= 0 || kmAtual <= kmAnterior) return 0;
  return (kmAtual - kmAnterior) / litros;
}

/** Get real consumption from fuel entries (requires at least 2 entries) */
export function getConsumoReal(): number | null {
  const fuelEntries = storage.getFuel();
  if (fuelEntries.length < 2) return null;
  
  const sorted = [...fuelEntries].sort((a, b) => a.odometer - b.odometer);
  
  let totalKm = 0;
  let totalLiters = 0;
  
  for (let i = 1; i < sorted.length; i++) {
    const kmDiff = sorted[i].odometer - sorted[i - 1].odometer;
    if (kmDiff > 0 && sorted[i].liters > 0) {
      totalKm += kmDiff;
      totalLiters += sorted[i].liters;
    }
  }
  
  if (totalLiters <= 0 || totalKm <= 0) return null;
  return totalKm / totalLiters;
}

/** Get active consumption: real if available, otherwise expected (fallback) */
export function obterConsumoAtivo(): { valor: number; modo: "real" | "estimado" } {
  const real = getConsumoReal();
  if (real !== null && real > 0) {
    return { valor: real, modo: "real" };
  }
  const profile = storage.getProfile();
  return { valor: profile.expectedConsumption, modo: "estimado" };
}

/** Validate fuel entry: KM must be greater than last entry */
export function validarAbastecimento(odometer: number): { valid: boolean; message?: string } {
  const fuelEntries = storage.getFuel();
  if (fuelEntries.length === 0) return { valid: true };
  
  const sorted = [...fuelEntries].sort((a, b) => b.odometer - a.odometer);
  const lastOdo = sorted[0].odometer;
  
  if (odometer <= lastOdo) {
    return { valid: false, message: `KM deve ser maior que o último abastecimento (${lastOdo.toLocaleString("pt-BR")} km)` };
  }
  return { valid: true };
}

// === Single source of truth: period summary ===
// All screens (Dashboard, Reports, Rides) MUST use this to compute totals
// and profit so numbers never disagree between views.
//
// Definitions:
//   ganhos       = soma do valor de todas as corridas no período
//   gastosReais  = combustível registrado + manutenção + extras (no período)
//   lucro        = ganhos − gastosReais   ← ÚNICA definição de "Lucro Líquido"
//   custoCombustivelEstimado  = projeção meramente informativa (km × R$/km)
export interface PeriodSummary {
  ganhos: number;
  gastosReais: number;
  combustivelReal: number;
  manutencao: number;
  extras: number;
  lucro: number;
  distancia: number;
  qtdCorridas: number;
  mediaPorCorrida: number;
  mediaPorKm: number;
  custoPorKm: number;
  margemLucro: number;
  litrosEstimados: number;
  custoCombustivelEstimado: number;
}

export function computePeriodSummary(filterFn: (d: string) => boolean): PeriodSummary {
  const rides = storage.getRides().filter((r) => filterFn(r.date));
  const fuel = storage.getFuel().filter((f) => filterFn(f.date));
  const maint = storage.getMaintenance().filter((m) => filterFn(m.date));
  const exp = storage.getExpenses().filter((e) => filterFn(e.date));

  const ganhos = rides.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const distancia = rides.reduce((s, r) => s + (Number(r.distance) || 0), 0);
  const combustivelReal = fuel.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const manutencao = maint.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const extras = exp.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const gastosReais = combustivelReal + manutencao + extras;
  const lucro = ganhos - gastosReais;

  const consumo = obterConsumoAtivo();
  const avgPrice = getAvgFuelPrice();
  const litrosEstimados = calcularLitrosGastos(distancia, consumo.valor);
  const custoCombustivelEstimado = calcularCustoCombustivel(distancia, consumo.valor, avgPrice);

  return {
    ganhos,
    gastosReais,
    combustivelReal,
    manutencao,
    extras,
    lucro,
    distancia,
    qtdCorridas: rides.length,
    mediaPorCorrida: rides.length > 0 ? ganhos / rides.length : 0,
    mediaPorKm: distancia > 0 ? ganhos / distancia : 0,
    custoPorKm: distancia > 0 ? gastosReais / distancia : 0,
    margemLucro: ganhos > 0 ? (lucro / ganhos) * 100 : 0,
    litrosEstimados,
    custoCombustivelEstimado,
  };
}
