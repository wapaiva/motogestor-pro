import { ArrowLeft, Cookie } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CookiePolicy() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Cookie className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Política de Cookies</h1>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">O que são Cookies?</h2>
          <p>Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você utiliza o MotoGestor Pro. Eles nos ajudam a melhorar sua experiência no aplicativo.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Cookies que utilizamos</h2>
          <div className="space-y-3">
            <div className="premium-card p-3">
              <p className="text-xs font-semibold text-card-foreground">🔒 Cookies Essenciais</p>
              <p className="text-[11px] text-muted-foreground mt-1">Necessários para o funcionamento do app, como autenticação e preferências de tema. Não podem ser desativados.</p>
            </div>
            <div className="premium-card p-3">
              <p className="text-xs font-semibold text-card-foreground">📊 Cookies de Desempenho</p>
              <p className="text-[11px] text-muted-foreground mt-1">Nos ajudam a entender como você utiliza o app para melhorar a performance e usabilidade.</p>
            </div>
            <div className="premium-card p-3">
              <p className="text-xs font-semibold text-card-foreground">📢 Cookies de Publicidade</p>
              <p className="text-[11px] text-muted-foreground mt-1">Utilizados para exibir anúncios relevantes na versão gratuita do app. Podem ser desativados na versão PRO.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Armazenamento Local</h2>
          <p>Utilizamos localStorage para armazenar seus dados financeiros localmente no dispositivo. Esses dados não são enviados para nossos servidores sem seu consentimento explícito.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Como gerenciar</h2>
          <p>Você pode limpar os dados armazenados a qualquer momento através das configurações do aplicativo (Perfil → Backup → Apagar Todos os Dados) ou pelas configurações do seu navegador.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Contato</h2>
          <p>Em caso de dúvidas sobre nossa política de cookies, entre em contato pelo e-mail: <span className="text-primary font-medium">suporte.motogestorpro@gmail.com</span></p>
        </section>

        <p className="text-[10px] text-muted-foreground/50 text-center pt-4">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
