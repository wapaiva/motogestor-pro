import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { storage, type UserProfile, type Goals } from "@/lib/storage";
import { saveProfileToFirestore } from "@/lib/firestore";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AccountTab from "@/components/profile/AccountTab";
import DataTab from "@/components/profile/DataTab";
import MotoTab from "@/components/profile/MotoTab";
import GoalsTab from "@/components/profile/GoalsTab";
import NotificationsTab from "@/components/profile/NotificationsTab";
import BackupTab from "@/components/profile/BackupTab";
import AboutTab from "@/components/profile/AboutTab";
import SettingsTab from "@/components/profile/SettingsTab";

type TabKey =
  | "conta"
  | "dados"
  | "moto"
  | "metas"
  | "notificacoes"
  | "configuracoes"
  | "backup"
  | "sobre";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authLogout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [goals, setGoals] = useState<Goals>(storage.getGoals());
  const [tab, setTab] = useState<TabKey>("conta");
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
      setTab("moto");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair do aplicativo?")) {
      await authLogout();
      toast.success("Você saiu do aplicativo. Até breve!");
      setTimeout(() => navigate("/login"), 400);
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "conta", label: "Conta" },
    { key: "dados", label: "Meus Dados" },
    { key: "moto", label: "Minha Moto" },
    { key: "metas", label: "Metas" },
    { key: "notificacoes", label: "Notificações" },
    { key: "configuracoes", label: "Configurações" },
    { key: "backup", label: "Backup" },
    { key: "sobre", label: "Sobre" },
  ];

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <ProfileHeader
        user={user}
        profile={profile}
        onAvatarChange={() => {
          // photoURL vem do Firebase Auth via onAuthChange; força re-render leve
          setProfile({ ...storage.getProfile() });
        }}
      />

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "conta" && <AccountTab user={user} />}
      {tab === "dados" && <DataTab user={user} profile={profile} setProfile={setProfile} />}
      {tab === "moto" && <MotoTab user={user} profile={profile} setProfile={setProfile} />}
      {tab === "metas" && <GoalsTab user={user} goals={goals} setGoals={setGoals} />}
      {tab === "notificacoes" && <NotificationsTab />}
      {tab === "configuracoes" && <SettingsTab user={user} />}
      {tab === "backup" && <BackupTab setProfile={setProfile} setGoals={setGoals} />}
      {tab === "sobre" && <AboutTab />}

      <div className="mt-4 animate-fade-in">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive py-3 rounded-xl font-semibold text-sm"
        >
          <LogOut className="w-4 h-4" /> Sair do Aplicativo
        </button>
      </div>
    </div>
  );
}
