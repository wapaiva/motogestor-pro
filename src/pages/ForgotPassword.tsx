import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { sendPasswordReset } from "@/lib/firebase";
import logo from "@/assets/logo.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
      toast.success("E-mail de recuperação enviado!");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") toast.error("E-mail não cadastrado");
      else if (code === "auth/invalid-email") toast.error("E-mail inválido");
      else if (code === "auth/too-many-requests") toast.error("Muitas tentativas. Tente novamente em alguns minutos.");
      else toast.error("Erro ao enviar e-mail. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="mb-8 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-primary/10 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="MotoGestor Pro" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Recuperar Senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        <div className="premium-card p-6 animate-slide-up">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="text-primary" size={28} />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Verifique seu e-mail</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Enviamos um link de recuperação para <span className="text-foreground font-semibold">{email}</span>.
                  Clique nele para criar uma nova senha.
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                Voltar ao Login
              </button>
              <button
                onClick={() => { setSent(false); }}
                className="text-xs text-muted-foreground underline underline-offset-2"
              >
                Reenviar para outro e-mail
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Seu e-mail cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
