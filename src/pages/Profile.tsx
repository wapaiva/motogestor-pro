import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  LogOut,
  User as UserIcon,
  Bike,
  Target,
  Settings as SettingsIcon,
  Info,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Flame,
  Wallet,
  Gauge,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthProvider";
import {
  storage,
  formatCurrency,
  isThisMonth,
  obterConsumoAtivo,
  type UserProfile,
  type Goals,
} from "@/lib/storage";
import { saveProfileToFirestore } from "@/lib/firestore";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AccountTab from "@/components/profile/AccountTab";
import DataTab from "@/components/profile/DataTab";
import MotoTab from "@/components/profile/MotoTab";
import GoalsTab from "@/components/profile/GoalsTab";
import AboutTab from "@/components/profile/AboutTab";
import SettingsTab from "@/components/profile/SettingsTab";

type Section =
  | "home"
  | "conta"
  | "dados"
  | "moto"
  | "metas"
  | "configuracoes"
  | "sobre";

const SECTION_TITLES: Record<Exclude<Section, "home">, string> = {
  conta: "Conta",
  dados: "Meus Dados",
  moto: "Minha Moto",
  metas: "Metas",
  configuracoes: "Configurações",
  sobre: "Sobre",
};

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authLogout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [goals, setGoals] = useState<Goals>(storage.getGoals());
  const [section, setSection] = useState<Section>("home");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const autofilledRef = useRef(false);

  // Autopreenchimento (sem sobrescrever dados editados)
  useEffect(() => {
    if (autofilledRef.current || !user) return;
    autofilledRef.current = true;
    const current = storage.getProfile();
    const updates: Partial<UserProfile> = {};
    if (!current.name?.trim() && user.displayName) {
      updates.name = user.displayName;
    }
    if (Object.keys(updates).length > 0) {
      const next = { ...current, ...updates };
      storage.saveProfile(next);
      setProfile(next);
      saveProfileToFirestore(user.uid, next).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo === "minha-moto") {
      setSection("moto");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Resumo do mês
  const summary = useMemo(() => {
    const rides = storage.getRides().filter((r) => isThisMonth(r.date));
    const ganhoMes = rides.reduce((s, r) => s + (r.amount || 0), 0);
    const consumo = obterConsumoAtivo();

    // Sequência de dias com corridas (consecutiva, terminando hoje ou ontem)
    const allRides = storage.getRides();
    const daySet = new Set(allRides.map((r) => new Date(r.date).toDateString()));
    let streak = 0;
    const cursor = new Date();
    // permite começar contando de ontem se hoje ainda não tem
    if (!daySet.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
    while (daySet.has(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return { ganhoMes, metaMes: goals.monthly || 0, streak, consumo };
  }, [goals.monthly]);

  const handleLogout = async () => {
    setConfirmLogout(false);
    await authLogout();
    toast.success("Você saiu do aplicativo. Até breve!");
    setTimeout(() => navigate("/login"), 400);
  };

  const menu: { key: Exclude<Section, "home" | "sobre">; label: string; icon: any; description: string }[] = [
    { key: "conta", label: "Conta", icon: UserIcon, description: "E-mail, segurança e verificação" },
    { key: "dados", label: "Meus Dados", icon: UserIcon, description: "Nome, cidade e tipo de serviço" },
    { key: "moto", label: "Minha Moto", icon: Bike, description: "Modelo, placa, KM e consumo" },
    { key: "metas", label: "Metas", icon: Target, description: "Diária, semanal e mensal" },
    { key: "configuracoes", label: "Configurações", icon: SettingsIcon, description: "Notificações, aparência e backup" },
  ];

  // Render de uma sub-tela com header de voltar
  if (section !== "home") {
    return (
      <div className="pb-20 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setSection("home")}
            className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{SECTION_TITLES[section]}</h1>
        </div>

        {section === "conta" && <AccountTab user={user} />}
        {section === "dados" && <DataTab user={user} profile={profile} setProfile={setProfile} />}
        {section === "moto" && <MotoTab user={user} profile={profile} setProfile={setProfile} />}
        {section === "metas" && <GoalsTab user={user} goals={goals} setGoals={setGoals} />}
        {section === "configuracoes" && (
          <SettingsTab user={user} setProfile={setProfile} setGoals={setGoals} />
        )}
        {section === "sobre" && <AboutTab />}
      </div>
    );
  }

  // Tela principal: header + summary + lista vertical
  const progressoMeta = summary.metaMes > 0 ? Math.min(100, (summary.ganhoMes / summary.metaMes) * 100) : 0;

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <ProfileHeader
        user={user}
        profile={profile}
        onAvatarChange={() => setProfile({ ...storage.getProfile() })}
      />

      {/* Card de Resumo */}
      <div className="glass-card rounded-2xl p-4 mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-card-foreground">Resumo do mês</h3>
          {summary.metaMes > 0 && (
            <span className="text-[11px] text-muted-foreground">{progressoMeta.toFixed(0)}% da meta</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <Wallet className="w-3.5 h-3.5" /> Ganho atual
            </div>
            <p className="text-base font-bold text-card-foreground">{formatCurrency(summary.ganhoMes)}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Meta mensal
            </div>
            <p className="text-base font-bold text-card-foreground">
              {summary.metaMes > 0 ? formatCurrency(summary.metaMes) : "Não definida"}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <Flame className="w-3.5 h-3.5" /> Sequência
            </div>
            <p className="text-base font-bold text-card-foreground">
              {summary.streak > 0 ? `${summary.streak} ${summary.streak === 1 ? "dia" : "dias"}` : "—"}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <Gauge className="w-3.5 h-3.5" /> Consumo
            </div>
            <p className="text-base font-bold text-card-foreground">
              {summary.consumo.valor > 0 ? `${summary.consumo.valor.toFixed(1)} km/L` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {summary.consumo.modo === "real" ? "Real" : "Estimado"}
            </p>
          </div>
        </div>
        {summary.metaMes > 0 && (
          <div className="mt-3 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressoMeta}%` }}
            />
          </div>
        )}
      </div>

      {/* Lista vertical de menu */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
        {menu.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/40 active:bg-secondary/60 transition-colors ${
                idx !== menu.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Sobre */}
      <div className="glass-card rounded-2xl overflow-hidden mt-3 animate-fade-in">
        <button
          onClick={() => setSection("sobre")}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/40 active:bg-secondary/60 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-card-foreground">Sobre</p>
            <p className="text-[11px] text-muted-foreground truncate">Versão, suporte e documentos legais</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>
      </div>

      {/* Logout */}
      <div className="mt-4 animate-fade-in">
        <button
          onClick={() => setConfirmLogout(true)}
          className="w-full flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive/15 text-destructive py-3 rounded-xl font-semibold text-sm transition-colors active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" /> Sair do aplicativo
        </button>
      </div>

      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do MotoGestor Pro?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair do MotoGestor Pro? Você precisará fazer login novamente para acessar sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
