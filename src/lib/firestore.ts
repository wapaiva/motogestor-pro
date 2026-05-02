import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Ride, FuelEntry, MaintenanceEntry, Expense, UserProfile, Goals } from "./storage";

const db = getFirebaseDb();

// === Helper ===
function userCollection(userId: string, col: string) {
  return collection(db, "users", userId, col);
}

function userDoc(userId: string) {
  return doc(db, "users", userId);
}

// === Profile ===
export async function saveProfileToFirestore(userId: string, profile: UserProfile) {
  await setDoc(userDoc(userId), { profile }, { merge: true });
}

export async function getProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDoc(userId));
  return snap.exists() ? (snap.data().profile as UserProfile) || null : null;
}

// === Goals ===
export async function saveGoalsToFirestore(userId: string, goals: Goals) {
  await setDoc(userDoc(userId), { goals }, { merge: true });
}

export async function getGoalsFromFirestore(userId: string): Promise<Goals | null> {
  const snap = await getDoc(userDoc(userId));
  return snap.exists() ? (snap.data().goals as Goals) || null : null;
}

// === Generic CRUD for subcollections ===
async function addItem<T extends { id: string }>(userId: string, col: string, item: T) {
  const ref = doc(db, "users", userId, col, item.id);
  await setDoc(ref, { ...item, userId });
}

async function deleteItem(userId: string, col: string, itemId: string) {
  await deleteDoc(doc(db, "users", userId, col, itemId));
}

async function getItems<T>(userId: string, col: string): Promise<T[]> {
  const q = query(userCollection(userId, col));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as T);
}

function subscribeItems<T>(userId: string, col: string, callback: (items: T[]) => void): Unsubscribe {
  const q = query(userCollection(userId, col));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as T));
  });
}

// === Rides ===
export const addRideToFirestore = (userId: string, ride: Ride) => addItem(userId, "corridas", ride);
export const deleteRideFromFirestore = (userId: string, id: string) => deleteItem(userId, "corridas", id);
export const getRidesFromFirestore = (userId: string) => getItems<Ride>(userId, "corridas");
export const subscribeRides = (userId: string, cb: (r: Ride[]) => void) => subscribeItems<Ride>(userId, "corridas", cb);

// === Fuel ===
export const addFuelToFirestore = (userId: string, fuel: FuelEntry) => addItem(userId, "abastecimentos", fuel);
export const deleteFuelFromFirestore = (userId: string, id: string) => deleteItem(userId, "abastecimentos", id);
export const getFuelFromFirestore = (userId: string) => getItems<FuelEntry>(userId, "abastecimentos");
export const subscribeFuel = (userId: string, cb: (f: FuelEntry[]) => void) => subscribeItems<FuelEntry>(userId, "abastecimentos", cb);

// === Maintenance ===
export const addMaintenanceToFirestore = (userId: string, m: MaintenanceEntry) => addItem(userId, "manutencao", m);
export const deleteMaintenanceFromFirestore = (userId: string, id: string) => deleteItem(userId, "manutencao", id);
export const getMaintenanceFromFirestore = (userId: string) => getItems<MaintenanceEntry>(userId, "manutencao");
export const subscribeMaintenance = (userId: string, cb: (m: MaintenanceEntry[]) => void) => subscribeItems<MaintenanceEntry>(userId, "manutencao", cb);

// === Expenses ===
export const addExpenseToFirestore = (userId: string, e: Expense) => addItem(userId, "gastos", e);
export const deleteExpenseFromFirestore = (userId: string, id: string) => deleteItem(userId, "gastos", id);
export const getExpensesFromFirestore = (userId: string) => getItems<Expense>(userId, "gastos");
export const subscribeExpenses = (userId: string, cb: (e: Expense[]) => void) => subscribeItems<Expense>(userId, "gastos", cb);

// === Sync: Load Firestore → localStorage (initial load) ===
// IMPORTANT: Always overwrite local cache so a previous user's residual data
// is wiped from this account's view.
export async function syncFromFirestore(userId: string) {
  const { storage } = await import("./storage");

  const [rides, fuel, maintenance, expenses, profile, goals] = await Promise.all([
    getRidesFromFirestore(userId),
    getFuelFromFirestore(userId),
    getMaintenanceFromFirestore(userId),
    getExpensesFromFirestore(userId),
    getProfileFromFirestore(userId),
    getGoalsFromFirestore(userId),
  ]);

  storage.saveRides(rides);
  storage.saveFuel(fuel);
  storage.saveMaintenance(maintenance);
  storage.saveExpenses(expenses);
  if (profile) storage.saveProfile(profile);
  if (goals) storage.saveGoals(goals);
}

// === Sync: localStorage → Firestore (migrate existing data) ===
// Only call this for the FIRST sign-in of a fresh account that already had
// guest data on the device. Never call after switching accounts.
export async function migrateLocalToFirestore(userId: string) {
  const { storage } = await import("./storage");

  const rides = storage.getRides();
  const fuel = storage.getFuel();
  const maintenance = storage.getMaintenance();
  const expenses = storage.getExpenses();
  const profile = storage.getProfile();
  const goals = storage.getGoals();

  const promises: Promise<void>[] = [];

  rides.forEach((r) => promises.push(addRideToFirestore(userId, r)));
  fuel.forEach((f) => promises.push(addFuelToFirestore(userId, f)));
  maintenance.forEach((m) => promises.push(addMaintenanceToFirestore(userId, m)));
  expenses.forEach((e) => promises.push(addExpenseToFirestore(userId, e)));
  promises.push(saveProfileToFirestore(userId, profile));
  promises.push(saveGoalsToFirestore(userId, goals));

  await Promise.all(promises);
}
