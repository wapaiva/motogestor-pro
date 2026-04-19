import { useState } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import {
  requestNotificationPermission,
  getNotificationSettings,
  toggleNotification,
  isNotificationSupported,
  getNotificationPermission,
} from "@/lib/notifications";

function NotificationToggles() {
  const [settings, setSettings] = useState(getNotificationSettings());
  const items = [
    { type: "daily_reminder", label: "Lembrete diário", desc: "Receba um lembrete para registrar suas corridas" },
    { type: "goal_alert", label: "Alerta de meta", desc: "Seja notificado quando atingir uma meta" },
    { type: "streak_reminder", label: "Lembrete de sequência", desc: "Não perca sua sequência de dias ativos" },
  ];
  return (
    <>
      {getNotificationPermission() !== "granted" && (
        <button
          onClick={async () => {
            const ok = await requestNotificationPermission();
            if (ok) toast.success("Notificações ativadas!");
            else toast.error("Permissão negada");
          }}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm"
        >
          Ativar Notificações
        </button>
      )}
      {items.map((item) => {
        const setting = settings.find((s) => s.type === item.type);
        const isEnabled = !!setting?.enabled;
        return (
          <div key={item.type} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium text-card-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            <button
              onClick={async () => {
                if (!isEnabled && getNotificationPermission() !== "granted") {
                  const ok = await requestNotificationPermission();
                  if (!ok) { toast.error("Permissão de notificação negada"); return; }
                }
                toggleNotification(item.type, !isEnabled);
                setSettings(getNotificationSettings());
                toast.success(!isEnabled ? `${item.label} ativado` : `${item.label} desativado`);
              }}
              className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${isEnabled ? "bg-primary" : "bg-secondary"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-primary-foreground absolute top-1 transition-transform ${isEnabled ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        );
      })}
    </>
  );
}

export default function NotificationsTab() {
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-card-foreground">Notificações</h3>
      </div>
      {!isNotificationSupported() ? (
        <p className="text-xs text-muted-foreground">Seu navegador não suporta notificações.</p>
      ) : getNotificationPermission() === "denied" ? (
        <p className="text-xs text-destructive">Notificações bloqueadas. Libere nas configurações do navegador.</p>
      ) : (
        <NotificationToggles />
      )}
    </div>
  );
}
