import { ArrowLeft, Cookie } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUPPORT_EMAIL = "suporte@motogestorpro.com";
const APP_NAME = "MotoGestor Pro";
const DEV_NAME = "WC Tech Labs";

export default function CookiePolicy() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="flex items-center gap-3 mb-1">
        <Cookie className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Política de Cookies</h1>
      </div>
      <p className="text-[10px] text-muted-foreground mb-6">Última atualização: Abril 2026</p>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. O que são Cookies e Tecnologias Semelhantes?</h2>
          <p>Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você utiliza um aplicativo ou site. Tecnologias semelhantes incluem localStorage, sessionStorage, pixels de rastreamento e identificadores de dispositivo. Essas tecnologias permitem armazenar preferências, manter sessões ativas e coletar dados de uso para melhoria do serviço.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Tecnologias Utilizadas</h2>
          <div className="space-y-3">
            <div className="premium-card p-3">
              <p className="text-xs font-semibold text-card-foreground">🔒 Cookies e Armazenamento Essenciais</p>
              <p className="text-[11px] text-muted-foreground mt-1">Necessários para o funcionamento básico do Aplicativo. Incluem: autenticação do usuário, preferências de tema (claro/escuro), estado do onboarding, consentimento LGPD e dados da sessão. <strong>Não podem ser desativados</strong>, pois o Aplicativo não funcionaria adequadamente sem eles.</p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">Exemplos: token de autenticação, mg_theme, mg_onboarding_done, mg_consent_accepted.</p>
            </div>
            <div className="premium-card p-3">
              <p className="text-xs font-semibold text-card-foreground">💾 Armazenamento Local de Dados (localStorage)</p>
              <p className="text-[11px] text-muted-foreground mt-1">Utilizamos o localStorage do navegador/WebView para armazenar seus dados financeiros (corridas, despesas, metas) diretamente no seu dispositivo. Esses dados permanecem exclusivamente no seu aparelho e <strong>não são enviados para nossos servidores</strong> sem seu consentimento explícito (ex.: backup em nuvem).</p>
            </div>
            <div className="premium-card p-3">
              <p className="text-xs font-semibold text-card-foreground">📊 Cookies de Desempenho e Análise</p>
              <p className="text-[11px] text-muted-foreground mt-1">Utilizados para coletar dados anonimizados sobre como você usa o Aplicativo, como páginas mais acessadas, tempo de sessão e funcionalidades mais utilizadas. Esses dados nos ajudam a melhorar a performance, corrigir erros e priorizar novas funcionalidades.</p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">Tecnologias: Google Analytics, Firebase Analytics.</p>
            </div>
            <div className="premium-card p-3">
              <p className="text-xs font-semibold text-card-foreground">📢 Cookies de Publicidade</p>
              <p className="text-[11px] text-muted-foreground mt-1">Na versão gratuita, utilizamos tecnologias de rastreamento de terceiros para exibir anúncios personalizados. Esses cookies coletam informações sobre seus interesses e comportamento de navegação para tornar os anúncios mais relevantes.</p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">Tecnologias: Google AdMob, Google Ads SDK.</p>
              <p className="text-[10px] text-primary mt-1 font-medium">✨ Na versão PRO, cookies de publicidade são completamente desativados.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Cookies de Terceiros</h2>
          <p className="mb-2">O Aplicativo pode utilizar serviços de terceiros que empregam cookies e tecnologias de rastreamento próprias:</p>
          <ul className="list-disc ml-4 space-y-1 text-xs">
            <li><strong>Google AdMob:</strong> exibição de anúncios personalizados (versão gratuita).</li>
            <li><strong>Google Analytics / Firebase:</strong> análise de uso e desempenho.</li>
            <li><strong>Google Play Services:</strong> autenticação e processamento de pagamentos.</li>
          </ul>
          <p className="mt-2 text-xs">Cada um desses serviços possui sua própria política de privacidade. Recomendamos a leitura das políticas do Google em <span className="text-primary">policies.google.com</span>.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Duração dos Cookies</h2>
          <ul className="list-disc ml-4 space-y-1 text-xs">
            <li><strong>Cookies de sessão:</strong> expiram ao fechar o Aplicativo.</li>
            <li><strong>Cookies persistentes:</strong> permanecem no dispositivo até serem excluídos manualmente ou até sua data de expiração (geralmente entre 30 dias e 2 anos, dependendo do cookie).</li>
            <li><strong>localStorage:</strong> persiste indefinidamente até ser excluído pelo Usuário ou pela desinstalação do Aplicativo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Como Gerenciar e Excluir</h2>
          <p className="mb-2">Você tem controle sobre os dados armazenados:</p>
          <ul className="list-disc ml-4 space-y-1 text-xs">
            <li><strong>No Aplicativo:</strong> acesse Perfil → Backup → Apagar Todos os Dados para limpar todos os dados locais.</li>
            <li><strong>No dispositivo:</strong> nas configurações do navegador ou do aplicativo, limpe cache e dados de armazenamento.</li>
            <li><strong>Anúncios personalizados:</strong> desative nas configurações do Google (Configurações → Google → Anúncios → Desativar personalização de anúncios).</li>
            <li><strong>Versão PRO:</strong> assine o plano Premium para eliminar completamente anúncios e cookies publicitários.</li>
          </ul>
          <p className="mt-2 text-xs"><strong>Atenção:</strong> a exclusão de cookies essenciais pode afetar o funcionamento do Aplicativo, exigindo novo login e reconfiguração de preferências.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Base Legal (LGPD)</h2>
          <p className="text-xs">O uso de cookies essenciais é baseado no legítimo interesse e na necessidade de execução do serviço (Art. 7º, V e IX, LGPD). Cookies de publicidade e análise são baseados no consentimento do Usuário (Art. 7º, I), que pode ser revogado a qualquer momento.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">7. Alterações nesta Política</h2>
          <p className="text-xs">Esta Política pode ser atualizada periodicamente para refletir mudanças nas tecnologias utilizadas ou na legislação aplicável. Notificaremos o Usuário sobre alterações significativas.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">8. Contato</h2>
          <p className="text-xs">Em caso de dúvidas sobre esta Política de Cookies ou sobre o tratamento de seus dados, entre em contato:</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs"><strong className="text-card-foreground">Desenvolvedor:</strong> {DEV_NAME}</p>
            <p className="text-xs"><strong className="text-card-foreground">E-mail:</strong> <span className="text-primary font-medium">{SUPPORT_EMAIL}</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
