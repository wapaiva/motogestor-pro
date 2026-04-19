import { toast } from "sonner";
import { Copy, UserIcon, KeyRound, MailCheck, BadgeCheck, AlertCircle } from "lucide-react";
import type { User } from "firebase/auth";
import { sendPasswordReset, resendVerificationEmail } from "@/lib/firebase";
import { playSuccessSound } from "@/lib/sounds";

const inputClass = "w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground";
const labelClass = "text-xs font-medium text-muted-foreground";

export default function AccountTab({ user }: { user: User | null }) {
  const handleChangePassword = async () => {
    if (!user?.email) { toast.error("Usuário sem e-mail cadastrado"); return; }
    try {
      await sendPasswordReset(user.email);
      playSuccessSound();
      toast.success("Enviamos um link para alterar sua senha no seu e-mail");
    } catch (err: any) {
      console.error("[changePassword]", err);
      toast.error(err?.message || "Não foi possível enviar o e-mail");
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      playSuccessSound();
      toast.success("E-mail de verificação reenviado");
    } catch (err: any) {
      console.error("[resendVerification]", err);
      toast.error(err?.message || "Não foi possível reenviar a verificação");
    }
  };

  const copyUid = async () => {
    if (!user?.uid) return;
    try { await navigator.clipboard.writeText(user.uid); toast.success("UID copiado"); }
    catch { toast.error("Não foi possível copiar"); }
  };

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-primary" /> Dados da Conta
        </h3>
        <div className="space-y-2">
          <div>
            <label className={labelClass}>E-mail</label>
            <input value={user?.email || "—"} readOnly className={`${inputClass} opacity-70 cursor-not-allowed`} />
          </div>
          <div>
            <label className={labelClass}>Status do e-mail</label>
            <div className="mt-1 flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg">
              {user?.emailVerified ? (
                <><BadgeCheck className="w-4 h-4 text-primary" /><span className="text-sm text-card-foreground">Verificado</span></>
              ) : (
                <><AlertCircle className="w-4 h-4 text-destructive" /><span className="text-sm text-card-foreground">Não verificado</span></>
              )}
            </div>
          </div>
          {user?.uid && (
            <div>
              <label className={labelClass}>UID</label>
              <button onClick={copyUid} className={`${inputClass} text-left flex items-center justify-between gap-2 hover:bg-secondary/50 transition-colors`}>
                <span className="truncate font-mono text-xs">{user.uid}</span>
                <Copy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <h3 className="text-sm font-semibold text-card-foreground mb-1">Segurança</h3>
        <button onClick={handleChangePassword} disabled={!user?.email}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium text-sm disabled:opacity-50">
          <KeyRound className="w-4 h-4" /> Alterar Senha
        </button>
        {!user?.emailVerified && user?.email && (
          <button onClick={handleResendVerification}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm">
            <MailCheck className="w-4 h-4" /> Reenviar Verificação de E-mail
          </button>
        )}
      </div>
    </div>
  );
}
