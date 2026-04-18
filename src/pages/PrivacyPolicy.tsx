import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUPPORT_EMAIL = "suporte@motogestorpro.com";
const APP_NAME = "MotoGestor Pro";
const DEV_NAME = "WC Tech Labs";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <h2 className="text-lg font-bold text-foreground mb-1">Política de Privacidade</h2>
      <p className="text-[10px] text-muted-foreground mb-4">Última atualização: Abril 2026</p>

      <div className="glass-card rounded-xl p-4 space-y-4 animate-fade-in">
        <p className="text-xs text-primary font-semibold">
          {APP_NAME} respeita sua privacidade e está em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e as Políticas de Dados do Usuário do Google Play.
        </p>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">1. Controlador dos Dados</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O controlador dos dados pessoais coletados pelo {APP_NAME} é <strong>{DEV_NAME}</strong>, que pode ser contatado pelo e-mail <span className="text-primary">{SUPPORT_EMAIL}</span>.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">2. Dados Coletados</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-1">Coletamos as seguintes categorias de dados, fornecidos voluntariamente pelo Usuário:</p>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc ml-4 space-y-1">
            <li><strong>Dados de identificação:</strong> nome, e-mail e foto de perfil (quando login social).</li>
            <li><strong>Dados financeiros:</strong> valores de corridas, ganhos, despesas, combustível e manutenção.</li>
            <li><strong>Dados do veículo:</strong> modelo, placa, quilometragem e ano.</li>
            <li><strong>Dados de uso:</strong> cidade de atuação, plataformas utilizadas, tipo de serviço.</li>
            <li><strong>Dados técnicos:</strong> identificador do dispositivo, versão do sistema operacional, logs de erro (coletados automaticamente para melhoria do serviço).</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">3. Finalidade do Tratamento</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-1">Os dados são tratados para as seguintes finalidades:</p>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc ml-4 space-y-1">
            <li>Funcionamento das funcionalidades do Aplicativo;</li>
            <li>Geração de relatórios, gráficos e análises financeiras personalizadas;</li>
            <li>Cálculo de metas e exibição de insights inteligentes;</li>
            <li>Backup e restauração de dados do Usuário;</li>
            <li>Autenticação e segurança da conta;</li>
            <li>Personalização de anúncios na versão gratuita;</li>
            <li>Melhoria contínua do Aplicativo e correção de erros;</li>
            <li>Comunicação com o Usuário sobre atualizações e novidades.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">4. Base Legal</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O tratamento de dados pessoais é realizado com base no consentimento do Usuário (Art. 7º, I, LGPD), na execução de contrato (Art. 7º, V) e no legítimo interesse do Controlador (Art. 7º, IX), conforme aplicável a cada finalidade.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">5. Armazenamento e Segurança</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Os dados financeiros são armazenados <strong>localmente no dispositivo</strong> do Usuário. Quando o backup em nuvem estiver ativado, os dados são armazenados em servidores seguros com criptografia em trânsito (TLS/HTTPS) e em repouso. Adotamos medidas técnicas e administrativas apropriadas para proteger os dados contra acesso não autorizado, destruição, perda, alteração ou vazamento.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">6. Compartilhamento com Terceiros</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-1">Seus dados pessoais podem ser compartilhados com:</p>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc ml-4 space-y-1">
            <li><strong>Google AdMob:</strong> dados anonimizados para personalização de anúncios na versão gratuita.</li>
            <li><strong>Google Analytics / Firebase:</strong> dados de uso agregados para análise de desempenho do Aplicativo.</li>
            <li><strong>Google Play:</strong> para processamento de assinaturas e pagamentos.</li>
            <li><strong>Autoridades competentes:</strong> quando exigido por lei ou ordem judicial.</li>
          </ul>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            <strong>Não vendemos, alugamos ou comercializamos seus dados pessoais</strong> para terceiros em nenhuma circunstância.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">7. Retenção de Dados</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Os dados pessoais serão retidos pelo tempo necessário para cumprir as finalidades descritas nesta Política, ou conforme exigido por lei. Dados armazenados localmente são excluídos com a desinstalação do Aplicativo. Dados em nuvem podem ser excluídos a qualquer momento pelo Usuário ou mediante solicitação ao e-mail de suporte.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">8. Seus Direitos (LGPD — Art. 18)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-1">O Usuário tem direito a:</p>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc ml-4 space-y-1">
            <li>Confirmar a existência de tratamento de seus dados;</li>
            <li>Acessar seus dados pessoais;</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
            <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>Solicitar a portabilidade dos dados (funcionalidade de exportação/backup);</li>
            <li>Solicitar a eliminação dos dados tratados com base em consentimento;</li>
            <li>Obter informação sobre compartilhamento de dados com terceiros;</li>
            <li>Revogar o consentimento a qualquer momento.</li>
          </ul>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            Para exercer seus direitos, entre em contato pelo e-mail <span className="text-primary font-medium">{SUPPORT_EMAIL}</span>. Responderemos em até 15 dias úteis.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">9. Dados de Menores</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O {APP_NAME} não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de crianças ou adolescentes. Caso tome conhecimento de que um menor forneceu dados pessoais, entre em contato para que possamos excluí-los.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">10. Transferência Internacional</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Alguns serviços de terceiros (Google, Firebase) podem processar dados em servidores localizados fora do Brasil. Nesses casos, garantimos que o tratamento segue padrões adequados de proteção, conforme previsto na LGPD.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">11. Alterações nesta Política</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Esta Política pode ser atualizada periodicamente. Notificaremos o Usuário sobre alterações significativas por meio de aviso no Aplicativo. Recomendamos a leitura periódica desta Política.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">12. Conformidade com o Google Play</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Esta Política está em conformidade com a Política de Dados do Usuário do Google Play, incluindo os requisitos de divulgação proeminente, consentimento e tratamento seguro de dados. O acesso, coleta, uso e compartilhamento de dados pessoais e sensíveis seguem estritamente as diretrizes do Google Play.
          </p>
        </section>

        <div className="border-t border-border pt-3 space-y-1">
          <p className="text-xs text-card-foreground font-medium">Desenvolvedor: {DEV_NAME}</p>
          <p className="text-xs text-muted-foreground">Contato: <span className="text-primary font-medium">{SUPPORT_EMAIL}</span></p>
        </div>
      </div>
    </div>
  );
}
