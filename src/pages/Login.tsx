import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { playMotoSound } from "@/lib/sounds";
import { useAuth } from "@/context/AuthProvider";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
} from "@/lib/firebase";
import { syncFromFirestore, migrateLocalToFirestore } from "@/lib/firestore";
import logo from "@/assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { enterAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const enterApp = () => {
    playMotoSound();
    setTimeout(() => navigate("/"), 400);
  };

  const handleEnterAsGuest = () => {
    enterAsGuest();
    enterApp();
  };

  const syncUserData = async (uid: string) => {
    try {
      // If user has local data, migrate to Firestore
      const { storage } = await import("@/lib/storage");
      const localRides = storage.getRides();
      if (localRides.length > 0) {
        await migrateLocalToFirestore(uid);
      }
      // Then sync from Firestore to localStorage
      await syncFromFirestore(uid);
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Preencha todos os campos"); return; }
    if (!isLogin && !name) { toast.error("Informe seu nome"); return; }

    setLoading(true);
    try {
      if (isLogin) {
        const cred = await loginWithEmail(email, password);
        await syncUserData(cred.user.uid);
      } else {
        const cred = await registerWithEmail(email, password, name);
        await syncUserData(cred.user.uid);
      }
      toast.success("Bem-vindo ao MotoGestor Pro!");
      enterApp();
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") toast.error("Usuário não encontrado");
      else if (code === "auth/wrong-password") toast.error("Senha incorreta");
      else if (code === "auth/email-already-in-use") toast.error("E-mail já cadastrado");
      else if (code === "auth/weak-password") toast.error("Senha muito fraca (mín. 6 caracteres)");
      else if (code === "auth/invalid-email") toast.error("E-mail inválido");
      else if (code === "auth/invalid-credential") toast.error("E-mail ou senha incorretos");
      else toast.error("Erro na autenticação. Tente novamente.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const cred = await loginWithGoogle();
      await syncUserData(cred.user.uid);
      toast.success("Login com Google realizado!");
      enterApp();
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error("Erro no login com Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-primary/10 flex items-center justify-center overflow-hidden animate-pulse-glow">
            <img src={logo} alt="MotoGestor Pro" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">MotoGestor Pro</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle financeiro inteligente para motoboys</p>
        </div>

        <div className="premium-card p-6 animate-slide-up">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isLogin ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-secondary text-secondary-foreground"}`}>
              Entrar
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${!isLogin ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-secondary text-secondary-foreground"}`}>
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <input type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary focus:outline-none transition-colors" />
            )}
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary focus:outline-none transition-colors" />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary focus:outline-none transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-muted-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50">
              {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <button onClick={handleGoogleLogin} disabled={loading}
            className="w-full py-3 bg-secondary/80 rounded-xl text-sm font-semibold text-foreground border border-border/50 hover:bg-secondary transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </button>

        </div>

        <div className="mt-6 flex gap-4 justify-center animate-fade-in">
          <button onClick={() => navigate("/termos")} className="text-[10px] text-muted-foreground underline underline-offset-2">Termos</button>
          <button onClick={() => navigate("/privacidade")} className="text-[10px] text-muted-foreground underline underline-offset-2">Privacidade</button>
          <button onClick={() => navigate("/cookies")} className="text-[10px] text-muted-foreground underline underline-offset-2">Cookies</button>
        </div>

        <p className="text-[10px] text-muted-foreground/50 text-center mt-4">Seus dados estão seguros e protegidos</p>
      </div>
    </div>
  );
}
