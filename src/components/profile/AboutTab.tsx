import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Copy, Mail, FileText, Shield, Cookie } from "lucide-react";
import logo from "@/assets/logo.png";
import { playSuccessSound } from "@/lib/sounds";

const SUPPORT_EMAIL = "suporte@motogestorpro.com";

export default function AboutTab() {
  const navigate = useNavigate();

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(SUPPORT_EMAIL); playSuccessSound(); toast.success("E-mail copiado!"); }
    catch { toast.error("Não foi possível copiar"); }
  };
  const sendEmail = () => { window.open(`mailto:${SUPPORT_EMAIL}?subject=Suporte MotoGestor Pro`, "_blank"); };

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <img src={logo} alt="MotoGestor Pro" className="w-16 h-16" width={64} height={64} />
        <div>
          <h3 className="text-base font-bold text-card-foreground">MotoGestor Pro</h3>
          <p className="text-xs text-muted-foreground">Versão 1.0.0</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-card-foreground leading-relaxed">
          O <strong>MotoGestor Pro</strong> é o aplicativo completo de gestão financeira pensado especialmente para
          motoboys e entregadores de aplicativo. Ele transforma a rotina de quem vive sobre duas rodas em dados
          claros e decisões inteligentes.
        </p>
        <p className="text-sm text-card-foreground leading-relaxed">
          Registre corridas, controle gastos com combustível e manutenção, acompanhe seu lucro líquido em tempo real,
          defina metas diárias, semanais e mensais e visualize relatórios detalhados sobre seu desempenho. Tudo em um
          só lugar, com sincronização segura na nuvem para você nunca perder seus dados.
        </p>
        <p className="text-sm text-card-foreground leading-relaxed">
          Mais que um app de finanças, o MotoGestor Pro é o seu parceiro de trabalho — feito para ajudar você a
          ganhar mais, gastar menos e ter total controle da sua atividade profissional.
        </p>
      </div>
      <p className="text-sm text-muted-foreground font-medium">
        Desenvolvido por <span className="text-primary font-semibold">WC Tech Labs</span>
      </p>
      <div className="border-t border-border pt-3 space-y-2">
        <h4 className="text-xs font-semibold text-card-foreground">Suporte</h4>
        <p className="text-xs text-muted-foreground">{SUPPORT_EMAIL}</p>
        <div className="flex gap-2">
          <button onClick={copyEmail} className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">
            <Copy className="w-3.5 h-3.5" /> Copiar E-mail
          </button>
          <button onClick={sendEmail} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">
            <Mail className="w-3.5 h-3.5" /> Enviar E-mail
          </button>
        </div>
      </div>
      <div className="border-t border-border pt-3 space-y-2">
        <button onClick={() => navigate("/termos")} className="w-full flex items-center gap-2 px-3 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">
          <FileText className="w-4 h-4" /> Termos de Uso
        </button>
        <button onClick={() => navigate("/privacidade")} className="w-full flex items-center gap-2 px-3 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">
          <Shield className="w-4 h-4" /> Política de Privacidade
        </button>
        <button onClick={() => navigate("/cookies")} className="w-full flex items-center gap-2 px-3 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">
          <Cookie className="w-4 h-4" /> Política de Cookies
        </button>
      </div>
    </div>
  );
}
