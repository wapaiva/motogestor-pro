import { useNavigate } from "react-router-dom";
import { Bell, Palette, Shield, Info, FileText, Cookie, ChevronRight, KeyRound, MailCheck, BadgeCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { User } from "firebase/auth";
import ThemeToggle from "@/components/ThemeToggle";
import { sendPasswordReset, resendVerificationEmail } from "@/lib/firebase";
import { playSuccessSound } from "@/lib/sounds";
import NotificationsTab from "./NotificationsTab";

const SUPPORT_EMAIL = "suporte@motogestorpro.com";

interface Props {
  user: User | null;
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" /> {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function LinkRow({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-secondary/60 hover:bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-colors"
    >
      <span className="flex items-center gap-2"><Icon className="w-4 h-4" /> {label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

export default function SettingsTab({ user }: Props) {
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (!user?.email) { toast.error("Usuário sem e-mail cadastrado"); return; }
    try {
      await sendPasswordReset(user.email);
      playSuccessSound();
      toast.success("Enviamos um link para alterar sua senha no seu e-mail");
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível enviar o e-mail");
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      playSuccessSound();
      toast.success("E-mail de verificação reenviado");
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível reenviar a verificação");
    }
  };

  return (
    <div className="space-y-3">
      {/* Notificações */}
      <NotificationsTab />

      {/* Aparência */}
      <Section icon={Palette} title="Aparência">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Tema do aplicativo</p>
          <ThemeToggle />
        </div>
      </Section>

      {/* Conta e Segurança */}
      <Section icon={Shield} title="Conta e Segurança">
        <div className="flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg">
          {user?.emailVerified ? (
            <><BadgeCheck className="w-4 h-4 text-primary" /><span className="text-sm text-card-foreground">E-mail verificado</span></>
          ) : (
            <><AlertCircle className="w-4 h-4 text-destructive" /><span className="text-sm text-card-foreground">E-mail não verificado</span></>
          )}
        </div>
        <button onClick={handleChangePassword} disabled={!user?.email}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium text-sm disabled:opacity-50">
          <KeyRound className="w-4 h-4" /> Alterar Senha
        </button>
        {!user?.emailVerified && user?.email && (
          <button onClick={handleResendVerification}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm">
            <MailCheck className="w-4 h-4" /> Reenviar Verificação
          </button>
        )}
      </Section>

      {/* Sobre */}
      <Section icon={Info} title="Sobre">
        <div className="px-1">
          <p className="text-sm font-semibold text-card-foreground">MotoGestor Pro</p>
          <p className="text-xs text-muted-foreground">Versão 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">Suporte: {SUPPORT_EMAIL}</p>
        </div>
        <LinkRow icon={FileText} label="Termos de Uso" onClick={() => navigate("/termos")} />
        <LinkRow icon={Shield} label="Política de Privacidade" onClick={() => navigate("/privacidade")} />
        <LinkRow icon={Cookie} label="Política de Cookies" onClick={() => navigate("/cookies")} />
      </Section>
    </div>
  );
}
