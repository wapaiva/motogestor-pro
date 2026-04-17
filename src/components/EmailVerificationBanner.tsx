import { useState } from "react";
import { Mail, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";
import { resendVerificationEmail } from "@/lib/firebase";

/**
 * Soft banner that appears when the logged-in user has not verified their email.
 * Hidden for guest sessions and Google sign-in users (already verified).
 */
export default function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isAuthenticated || !user || user.emailVerified || dismissed) return null;
  // Guest users have no email
  if (!user.email) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerificationEmail();
      toast.success("E-mail de verificação reenviado!");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/too-many-requests") {
        toast.error("Aguarde alguns minutos antes de reenviar.");
      } else {
        toast.error("Erro ao reenviar. Tente novamente.");
      }
    }
    setSending(false);
  };

  return (
    <div className="mx-4 mt-3 rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 flex items-center gap-3 animate-fade-in">
      <Mail className="text-primary shrink-0" size={18} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">Verifique seu e-mail</p>
        <p className="text-[11px] text-muted-foreground truncate">
          Enviamos um link para <span className="text-foreground">{user.email}</span>
        </p>
      </div>
      <button
        onClick={handleResend}
        disabled={sending}
        className="text-[11px] font-bold text-primary hover:underline disabled:opacity-50"
      >
        {sending ? "..." : "Reenviar"}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Fechar"
      >
        <X size={16} />
      </button>
    </div>
  );
}
