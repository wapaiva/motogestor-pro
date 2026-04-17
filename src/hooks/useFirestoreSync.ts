import { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { storage } from "@/lib/storage";
import {
  subscribeRides,
  subscribeFuel,
  subscribeMaintenance,
  subscribeExpenses,
} from "@/lib/firestore";

/**
 * Real-time sync hook.
 * Subscribes to all user collections via onSnapshot and mirrors them to
 * localStorage so the existing storage.getX() API stays in sync across devices.
 *
 * Mount once at the top of the protected app (e.g. inside ProtectedRoute or App).
 */
export function useFirestoreSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubs = [
      subscribeRides(user.uid, (rides) => storage.saveRides(rides)),
      subscribeFuel(user.uid, (fuel) => storage.saveFuel(fuel)),
      subscribeMaintenance(user.uid, (m) => storage.saveMaintenance(m)),
      subscribeExpenses(user.uid, (e) => storage.saveExpenses(e)),
    ];

    // Notify other components that data may have changed
    const notify = () => window.dispatchEvent(new Event("mg:data-sync"));
    const interval = setInterval(notify, 1500);

    return () => {
      unsubs.forEach((u) => u && u());
      clearInterval(interval);
    };
  }, [user?.uid]);
}
