import { useState, useEffect } from "react";
import { Shield, Cookie } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ConsentDialog() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accepted = localStorage.getItem("mg_consent_accepted");
    if (!accepted) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem("mg_consent_accepted", new Date().toISOString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <h2 className="text-base font-bold text-card-foreground">Seus dados estão seguros</h2>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          O MotoGestor Pro armazena seus dados financeiros <strong>localmente no seu dispositivo</strong>. Não compartilhamos suas informações pessoais sem seu consentimento.
        </p>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Na versão gratuita, anúncios podem coletar dados anonimizados para personalização, conforme nossa Política de Privacidade.
        </p>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Ao continuar, você concorda com nossos{" "}
          <button onClick={() => navigate("/termos")} className="text-primary underline">Termos de Uso</button>,{" "}
          <button onClick={() => navigate("/privacidade")} className="text-primary underline">Política de Privacidade</button>{" "}e{" "}
          <button onClick={() => navigate("/cookies")} className="text-primary underline">Política de Cookies</button>.
        </p>

        <div className="space-y-2 pt-2">
          <button onClick={accept} className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
            Aceitar e Continuar
          </button>
          <p className="text-[10px] text-muted-foreground text-center">
            Você pode revogar o consentimento a qualquer momento nas configurações do app.
          </p>
        </div>
      </div>
    </div>
  );
}
