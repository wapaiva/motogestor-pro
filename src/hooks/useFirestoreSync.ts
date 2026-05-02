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
 * the user-scoped localStorage so existing storage.getX() calls stay in sync.
 *
 * Each snapshot dispatches `mg:data-sync` so screens re-render immediately.
 */
function notifyDataSync() {
  window.dispatchEvent(new Event("mg:data-sync"));
}

export function useFirestoreSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubs = [
      subscribeRides(user.uid, (rides) => {
        storage.saveRides(rides);
        notifyDataSync();
      }),
      subscribeFuel(user.uid, (fuel) => {
        storage.saveFuel(fuel);
        notifyDataSync();
      }),
      subscribeMaintenance(user.uid, (m) => {
        storage.saveMaintenance(m);
        notifyDataSync();
      }),
      subscribeExpenses(user.uid, (e) => {
        storage.saveExpenses(e);
        notifyDataSync();
      }),
    ];

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [user?.uid]);
}
