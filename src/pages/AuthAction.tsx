import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { confirmPasswordResetWithCode, applyEmailVerification } from "@/lib/firebase";
import logo from "@/assets/logo.png";

/**
 * Firebase Auth action handler.
 * Handles the URL parameters Firebase appends when the user clicks the link
 * in a password reset / email verification email.
 *
 * Expected URL: /auth/action?mode=resetPassword&oobCode=XYZ
 *               /auth/action?mode=verifyEmail&oobCode=XYZ
 */
export default function AuthAction() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get("mode");
  const oobCode = params.get("oobCode") || "";

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset password state
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Auto-handle email verification
  useEffect(() => {
    if (mode === "verifyEmail" && oobCode) {
      (async () => {
        setLoading(true);
        try {
          await applyEmailVerification(oobCode);
          setDone(true);
          toast.success("E-mail verificado com sucesso!");
        } catch (err: any) {
          setError("Link inválido ou expirado. Solicite um novo e-mail de verificação.");
        }
        setLoading(false);
      })();
    }
  }, [mode, oobCode]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordResetWithCode(oobCode, password);
      setDone(true);
      toast.success("Senha redefinida com sucesso!");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/expired-action-code") setError("Link expirado. Solicite um novo.");
      else if (code === "auth/invalid-action-code") setError("Link inválido. Solicite um novo.");
      else if (code === "auth/weak-password") toast.error("Senha muito fraca");
      else setError("Erro ao redefinir senha. Tente novamente.");
    }
    setLoading(false);
  };

  if (!mode || !oobCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="premium-card p-6 max-w-sm w-full text-center">
          <AlertCircle className="mx-auto text-destructive mb-3" size={40} />
          <h1 className="font-bold text-foreground">Link inválido</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Este link de autenticação não é válido ou está incompleto.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-primary/10 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="MotoGestor Pro" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {mode === "resetPassword" ? "Nova Senha" : "Verificação de E-mail"}
          </h1>
        </div>

        <div className="premium-card p-6 animate-slide-up">
          {error ? (
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto text-destructive" size={40} />
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => navigate("/esqueci-senha")}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold"
              >
                Solicitar novo link
              </button>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="mx-auto text-primary" size={48} />
              <div>
                <h2 className="font-bold text-foreground">
                  {mode === "resetPassword" ? "Senha alterada!" : "E-mail confirmado!"}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {mode === "resetPassword"
                    ? "Você já pode entrar com sua nova senha."
                    : "Sua conta está verificada. Bons rolês!"}
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/25"
              >
                Ir para o Login
              </button>
            </div>
          ) : mode === "resetPassword" ? (
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirme a nova senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Redefinir Senha"}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground mt-4">Verificando seu e-mail...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
