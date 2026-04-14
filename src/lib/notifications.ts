// Push Notifications support
// Uses the Web Notifications API + service worker for background notifications

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Este navegador não suporta notificações push");
    return false;
  }

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export function sendLocalNotification(title: string, body: string, icon?: string) {
  if (Notification.permission !== "granted") return;

  try {
    const options: Record<string, unknown> = {
      body,
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "motogestor-" + Date.now(),
    };
    new Notification(title, options as NotificationOptions);
  } catch {
    // Fallback for environments that don't support Notification constructor
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SHOW_NOTIFICATION",
        title,
        body,
        icon: icon || "/icons/icon-192.png",
      });
    }
  }
}

// Scheduled notification helpers
const NOTIFICATION_KEY = "mg_notifications";

interface ScheduledNotification {
  id: string;
  type: "daily_reminder" | "goal_alert" | "streak_reminder";
  enabled: boolean;
  time?: string; // HH:mm
}

export function getNotificationSettings(): ScheduledNotification[] {
  const saved = localStorage.getItem(NOTIFICATION_KEY);
  if (saved) return JSON.parse(saved);
  return [
    { id: "daily_reminder", type: "daily_reminder", enabled: false, time: "08:00" },
    { id: "goal_alert", type: "goal_alert", enabled: false },
    { id: "streak_reminder", type: "streak_reminder", enabled: false, time: "20:00" },
  ];
}

export function saveNotificationSettings(settings: ScheduledNotification[]) {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings));
}

export function toggleNotification(type: string, enabled: boolean) {
  const settings = getNotificationSettings();
  const idx = settings.findIndex((s) => s.type === type);
  if (idx >= 0) {
    settings[idx].enabled = enabled;
    saveNotificationSettings(settings);
  }
}

// Check and send daily notifications
export function checkDailyNotifications() {
  const settings = getNotificationSettings();
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const dailyReminder = settings.find((s) => s.type === "daily_reminder");
  if (dailyReminder?.enabled && dailyReminder.time === currentTime) {
    sendLocalNotification(
      "🏍️ Bora trabalhar!",
      "Registre suas corridas no MotoGestor Pro e acompanhe seus ganhos do dia."
    );
  }

  const streakReminder = settings.find((s) => s.type === "streak_reminder");
  if (streakReminder?.enabled && streakReminder.time === currentTime) {
    sendLocalNotification(
      "🔥 Mantenha sua sequência!",
      "Não esqueça de registrar as corridas de hoje para manter sua sequência ativa."
    );
  }
}

// Goal completion notification
export function notifyGoalReached(goalType: string, amount: number) {
  const settings = getNotificationSettings();
  const goalAlert = settings.find((s) => s.type === "goal_alert");
  if (!goalAlert?.enabled) return;

  const labels: Record<string, string> = {
    daily: "diária",
    weekly: "semanal",
    monthly: "mensal",
  };

  sendLocalNotification(
    "🎯 Meta atingida!",
    `Parabéns! Você atingiu sua meta ${labels[goalType] || goalType} de R$ ${amount.toFixed(2)}!`
  );
}
