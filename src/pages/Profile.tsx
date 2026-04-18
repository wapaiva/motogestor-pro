import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Copy, Mail, FileText, Shield, Database, Download, Trash2, LogOut, Bell, User as UserIcon, KeyRound, MailCheck, BadgeCheck, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { storage, UserProfile, Goals, formatCurrency } from "@/lib/storage";
import { playSuccessSound } from "@/lib/sounds";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthProvider";
import { saveProfileToFirestore, saveGoalsToFirestore } from "@/lib/firestore";
import { sendPasswordReset, resendVerificationEmail } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  requestNotificationPermission,
  getNotificationSettings,
  toggleNotification,
  isNotificationSupported,
  getNotificationPermission,
} from "@/lib/notifications";

const SUPPORT_EMAIL = "suporte@motogestorpro.com";
const inputClass = "w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground";
const labelClass = "text-xs font-medium text-muted-foreground";

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
            if (ok) { toast.success("Notificações ativadas!"); } else { toast.error("Permissão negada"); }
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

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authLogout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [goals, setGoals] = useState<Goals>(storage.getGoals());
  const [tab, setTab] = useState<"dados" | "moto" | "metas" | "notificacoes" | "backup" | "sobre">("dados");

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo === "minha-moto") {
      setTab("moto");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const saveProfile = () => {
    storage.saveProfile(profile);
    if (user) saveProfileToFirestore(user.uid, profile).catch(console.error);
    playSuccessSound();
    toast.success("Dados atualizados com sucesso");
  };
  const saveGoals = () => {
    storage.saveGoals(goals);
    if (user) saveGoalsToFirestore(user.uid, goals).catch(console.error);
    playSuccessSound();
    toast.success("Metas salvas com sucesso");
  };

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(SUPPORT_EMAIL); playSuccessSound(); toast.success("E-mail copiado!"); }
    catch { toast.error("Não foi possível copiar"); }
  };

  const sendEmail = () => { window.open(`mailto:${SUPPORT_EMAIL}?subject=Suporte MotoGestor Pro`, "_blank"); };

  const exportBackup = () => {
    const data = { rides: storage.getRides(), fuel: storage.getFuel(), maintenance: storage.getMaintenance(), expenses: storage.getExpenses(), profile: storage.getProfile(), goals: storage.getGoals(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `motogestor_backup_${new Date().toISOString().split("T")[0]}.json`; a.click();
    URL.revokeObjectURL(url); playSuccessSound(); toast.success("Backup exportado!");
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.rides) storage.saveRides(data.rides);
        if (data.fuel) storage.saveFuel(data.fuel);
        if (data.maintenance) storage.saveMaintenance(data.maintenance);
        if (data.expenses) storage.saveExpenses(data.expenses);
        if (data.profile) storage.saveProfile(data.profile);
        if (data.goals) storage.saveGoals(data.goals);
        playSuccessSound(); toast.success("Backup restaurado!");
        setProfile(storage.getProfile()); setGoals(storage.getGoals());
      } catch { toast.error("Erro ao restaurar backup. Arquivo inválido."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearAllData = () => {
    if (confirm("Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.")) {
      storage.saveRides([]); storage.saveFuel([]); storage.saveMaintenance([]); storage.saveExpenses([]);
      storage.saveProfile({ name: "", city: "", serviceType: "", motoModel: "", motoYear: "", motoPlate: "", currentKm: 0, expectedConsumption: 30 });
      storage.saveGoals({ daily: 200, weekly: 1200, monthly: 5000 });
      setProfile(storage.getProfile()); setGoals(storage.getGoals());
      toast.success("Todos os dados foram apagados");
    }
  };

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair do aplicativo?")) {
      await authLogout();
      toast.success("Você saiu do aplicativo. Até breve!");
      setTimeout(() => navigate("/login"), 400);
    }
  };

  const tabs = [
    { key: "dados" as const, label: "Meus Dados" },
    { key: "moto" as const, label: "Minha Moto" },
    { key: "metas" as const, label: "Metas" },
    { key: "notificacoes" as const, label: "Notificações" },
    { key: "backup" as const, label: "Backup" },
    { key: "sobre" as const, label: "Sobre" },
  ];

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-foreground mb-4">Perfil</h2>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dados" && (
        <div className="glass-card rounded-xl p-4 animate-fade-in space-y-3">
          <div><label className={labelClass}>Nome</label><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} placeholder="Seu nome" /></div>
          <div><label className={labelClass}>Cidade</label><input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className={inputClass} placeholder="Sua cidade" /></div>
          <div><label className={labelClass}>Tipo de Serviço Principal</label><input value={profile.serviceType} onChange={(e) => setProfile({ ...profile, serviceType: e.target.value })} className={inputClass} placeholder="Ex: Entregador" /></div>
          <div className="border-t border-border pt-3"><label className={labelClass}>Tema do App</label><div className="mt-1.5"><ThemeToggle /></div></div>
          <button onClick={saveProfile} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm">Salvar</button>
        </div>
      )}

      {tab === "moto" && (
        <div className="glass-card rounded-xl p-4 animate-fade-in space-y-3">
          <div>
            <label className={labelClass}>Modelo <span className="text-destructive">*</span></label>
            <input value={profile.motoModel} onChange={(e) => setProfile({ ...profile, motoModel: e.target.value })} className={inputClass} placeholder="Ex: Honda CG 160" />
            {!profile.motoModel && <p className="text-[10px] text-destructive mt-0.5">Campo obrigatório</p>}
          </div>
          <div>
            <label className={labelClass}>Ano <span className="text-destructive">*</span></label>
            <input value={profile.motoYear} onChange={(e) => setProfile({ ...profile, motoYear: e.target.value })} className={inputClass} placeholder="Ex: 2023" />
            {!profile.motoYear && <p className="text-[10px] text-destructive mt-0.5">Campo obrigatório</p>}
          </div>
          <div><label className={labelClass}>Placa (opcional)</label><input value={profile.motoPlate} onChange={(e) => setProfile({ ...profile, motoPlate: e.target.value })} className={inputClass} placeholder="ABC-1234" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>KM Atual <span className="text-destructive">*</span></label>
              <input type="number" value={profile.currentKm || ""} onChange={(e) => setProfile({ ...profile, currentKm: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Consumo (km/L) <span className="text-destructive">*</span></label>
              <input type="number" value={profile.expectedConsumption || ""} onChange={(e) => setProfile({ ...profile, expectedConsumption: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" />
              <p className="text-[10px] text-muted-foreground mt-0.5">Informe quantos km sua moto faz por litro</p>
              {profile.expectedConsumption <= 0 && <p className="text-[10px] text-destructive mt-0.5">Deve ser maior que zero</p>}
            </div>
          </div>
          {profile.expectedConsumption > 0 && (
            <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
              <p className="text-[10px] text-muted-foreground">Custo estimado por km: <span className="font-semibold text-card-foreground">{(() => { const fuel = storage.getFuel(); if (fuel.length === 0) return "Cadastre abastecimentos"; const recent = [...fuel].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5); const avgPrice = recent.reduce((s, f) => s + (f.amount / f.liters), 0) / recent.length; return formatCurrency(avgPrice / profile.expectedConsumption) + "/km"; })()}</span></p>
            </div>
          )}
          <button onClick={() => {
            if (!profile.motoModel.trim()) { toast.error("Informe o modelo da moto"); return; }
            if (!profile.motoYear.trim()) { toast.error("Informe o ano da moto"); return; }
            if (profile.expectedConsumption <= 0) { toast.error("Consumo (km/L) deve ser maior que zero"); return; }
            saveProfile();
          }} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm">Salvar</button>
        </div>
      )}

      {tab === "metas" && (
        <div className="glass-card rounded-xl p-4 animate-fade-in space-y-3">
          <div><label className={labelClass}>Meta Diária (R$)</label><input type="number" value={goals.daily || ""} onChange={(e) => setGoals({ ...goals, daily: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" /></div>
          <div><label className={labelClass}>Meta Semanal (R$)</label><input type="number" value={goals.weekly || ""} onChange={(e) => setGoals({ ...goals, weekly: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" /></div>
          <div><label className={labelClass}>Meta Mensal (R$)</label><input type="number" value={goals.monthly || ""} onChange={(e) => setGoals({ ...goals, monthly: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" /></div>
          <button onClick={saveGoals} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm">Salvar Metas</button>
        </div>
      )}

      {tab === "notificacoes" && (
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
      )}

      {tab === "backup" && (
        <div className="glass-card rounded-xl p-4 animate-fade-in space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-1 flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Backup e Dados</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">Exporte seus dados para manter uma cópia de segurança ou restaure um backup anterior.</p>
          </div>
          <button onClick={exportBackup} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm"><Download className="w-4 h-4" /> Exportar Backup</button>
          <div>
            <input type="file" accept=".json" onChange={importBackup} className="hidden" id="import-backup" />
            <label htmlFor="import-backup" className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium text-sm cursor-pointer"><Database className="w-4 h-4" /> Restaurar Backup</label>
          </div>
          <div className="border-t border-border pt-3">
            <button onClick={clearAllData} className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive py-2.5 rounded-lg font-medium text-sm"><Trash2 className="w-4 h-4" /> Apagar Todos os Dados</button>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">Esta ação não pode ser desfeita</p>
          </div>
        </div>
      )}

      {tab === "sobre" && (
        <div className="glass-card rounded-xl p-4 animate-fade-in space-y-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MotoGestor Pro" className="w-16 h-16" width={64} height={64} />
            <div>
              <h3 className="text-base font-bold text-card-foreground">MotoGestor Pro</h3>
              <p className="text-xs text-muted-foreground">Versão 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-card-foreground leading-relaxed">O MotoGestor Pro é o aplicativo completo de gestão financeira para motoboys, entregadores e motoristas de aplicativo. Desenvolvido com tecnologia de ponta, ele permite que você registre corridas e ganhos nas principais plataformas, controle gastos com combustível, manutenção e despesas extras, acompanhe seu lucro líquido em tempo real e defina metas financeiras diárias, semanais e mensais. Com gráficos inteligentes, insights automáticos, sistema de conquistas e gamificação, o MotoGestor Pro transforma o jeito como você gerencia suas finanças na estrada. Tudo isso com uma interface premium, segura e pensada para o dia a dia do profissional sobre duas rodas.</p>
          <p className="text-sm text-muted-foreground font-medium">Desenvolvido por <span className="text-primary font-semibold">WC Tech Labs</span></p>
          <div className="border-t border-border pt-3 space-y-2">
            <h4 className="text-xs font-semibold text-card-foreground">Suporte</h4>
            <p className="text-xs text-muted-foreground">{SUPPORT_EMAIL}</p>
            <div className="flex gap-2">
              <button onClick={copyEmail} className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium"><Copy className="w-3.5 h-3.5" /> Copiar E-mail</button>
              <button onClick={sendEmail} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium"><Mail className="w-3.5 h-3.5" /> Enviar E-mail</button>
            </div>
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <button onClick={() => navigate("/termos")} className="w-full flex items-center gap-2 px-3 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium"><FileText className="w-4 h-4" /> Termos de Uso</button>
            <button onClick={() => navigate("/privacidade")} className="w-full flex items-center gap-2 px-3 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium"><Shield className="w-4 h-4" /> Política de Privacidade</button>
          </div>
        </div>
      )}

      <div className="mt-4 animate-fade-in">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive py-3 rounded-xl font-semibold text-sm">
          <LogOut className="w-4 h-4" /> Sair do Aplicativo
        </button>
      </div>
    </div>
  );
}
