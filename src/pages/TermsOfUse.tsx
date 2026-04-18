import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUPPORT_EMAIL = "suporte@motogestorpro.com";
const APP_NAME = "MotoGestor Pro";
const DEV_NAME = "WC Tech Labs";

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <h2 className="text-lg font-bold text-foreground mb-1">Termos de Uso</h2>
      <p className="text-[10px] text-muted-foreground mb-4">Última atualização: Abril 2026</p>

      <div className="glass-card rounded-xl p-4 space-y-4 animate-fade-in">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Bem-vindo ao <strong className="text-card-foreground">{APP_NAME}</strong>. Ao baixar, instalar ou utilizar este aplicativo, você concorda integralmente com os presentes Termos de Uso. Caso não concorde, não utilize o aplicativo.
        </p>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">1. Definições</h3>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc ml-4 space-y-1">
            <li><strong>Aplicativo:</strong> o software {APP_NAME}, disponibilizado para dispositivos móveis.</li>
            <li><strong>Usuário:</strong> toda pessoa física que utiliza o Aplicativo.</li>
            <li><strong>Desenvolvedor:</strong> {DEV_NAME}, responsável pelo desenvolvimento e manutenção.</li>
            <li><strong>Conteúdo:</strong> textos, imagens, gráficos, relatórios e demais materiais exibidos no Aplicativo.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">2. Descrição do Serviço</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O {APP_NAME} é uma ferramenta de gestão financeira pessoal destinada a profissionais de transporte por motocicleta (motoboys, entregadores e motoristas de aplicativo). O aplicativo permite o registro de corridas, controle de despesas, geração de relatórios financeiros e acompanhamento de metas. Os cálculos e análises são meramente informativos e <strong>não substituem consultoria contábil, fiscal ou financeira profissional</strong>.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">3. Cadastro e Conta</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O Usuário poderá criar uma conta utilizando e-mail/senha ou autenticação social (Google). O Usuário é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta. O Usuário compromete-se a fornecer informações verdadeiras, atualizadas e completas.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">4. Uso Aceitável</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-1">O Usuário compromete-se a:</p>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc ml-4 space-y-1">
            <li>Utilizar o Aplicativo apenas para fins lícitos e conforme estes Termos;</li>
            <li>Não tentar realizar engenharia reversa, descompilar ou desmontar o Aplicativo;</li>
            <li>Não utilizar robôs, scrapers ou meios automatizados para acessar o Aplicativo;</li>
            <li>Não transmitir vírus, malware ou qualquer código malicioso;</li>
            <li>Não violar direitos de propriedade intelectual do Desenvolvedor ou terceiros.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">5. Versão Gratuita e Premium (PRO)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O Aplicativo é oferecido em versão gratuita com funcionalidades básicas e exibição de anúncios. A versão Premium (PRO) remove anúncios e libera funcionalidades adicionais mediante pagamento de assinatura processada pela Google Play Store. O cancelamento da assinatura segue as políticas da Google Play. Não há reembolso proporcional por período não utilizado, exceto conforme previsto nas políticas da Google Play.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">6. Anúncios e Publicidade</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A versão gratuita exibe anúncios fornecidos por redes de publicidade de terceiros (Google AdMob). Esses anúncios não representam recomendação ou endosso do Desenvolvedor. O conteúdo dos anúncios é de responsabilidade exclusiva dos anunciantes. Dados anonimizados podem ser coletados para personalização de anúncios, conforme detalhado na Política de Privacidade.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">7. Propriedade Intelectual</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Todo o conteúdo do Aplicativo, incluindo mas não se limitando a textos, gráficos, logotipos, ícones, imagens, clipes de áudio, código-fonte e compilações de dados, é de propriedade exclusiva do Desenvolvedor ou de seus licenciadores e está protegido pelas leis de direitos autorais e propriedade intelectual brasileiras e internacionais.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">8. Armazenamento de Dados</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Os dados financeiros do Usuário são armazenados localmente no dispositivo e/ou em servidores seguros quando o backup em nuvem estiver ativado. O Usuário é responsável por realizar backups regulares de seus dados. O Desenvolvedor não se responsabiliza por perda de dados decorrente de falha do dispositivo, desinstalação do Aplicativo ou outros eventos fora de seu controle.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">9. Isenção de Garantias</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O Aplicativo é fornecido "como está" (as is), sem garantias de qualquer tipo, expressas ou implícitas. O Desenvolvedor não garante que o Aplicativo será ininterrupto, livre de erros ou que atenderá todas as necessidades do Usuário. O Usuário assume todos os riscos relacionados ao uso do Aplicativo.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">10. Limitação de Responsabilidade</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Em nenhuma circunstância o Desenvolvedor será responsável por danos diretos, indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes do uso ou da impossibilidade de uso do Aplicativo, incluindo, sem limitação, perda de lucros, dados, receitas ou oportunidades de negócio, mesmo que tenha sido avisado da possibilidade de tais danos.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">11. Indenização</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O Usuário concorda em indenizar e isentar o Desenvolvedor de quaisquer reclamações, perdas, danos, custos e despesas (incluindo honorários advocatícios) decorrentes do uso indevido do Aplicativo ou da violação destes Termos.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">12. Modificações dos Termos</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O Desenvolvedor reserva-se o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por meio de notificação no Aplicativo. O uso continuado após a publicação das alterações constitui aceitação dos novos Termos.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">13. Rescisão</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O Desenvolvedor pode suspender ou encerrar o acesso do Usuário ao Aplicativo, sem aviso prévio, caso haja violação destes Termos. O Usuário pode encerrar sua conta a qualquer momento, desinstalando o Aplicativo e solicitando a exclusão de seus dados pelo e-mail de suporte.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">14. Legislação Aplicável e Foro</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer controvérsia será submetida ao foro da comarca do domicílio do Usuário, conforme previsto no Código de Defesa do Consumidor (Lei nº 8.078/1990).
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">15. Conformidade com a Play Store</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Este Aplicativo está em conformidade com as Políticas do Programa para Desenvolvedores do Google Play, incluindo as diretrizes sobre privacidade, conteúdo, monetização e comportamento do aplicativo. Quaisquer disputas relacionadas a compras no aplicativo seguem as políticas de reembolso da Google Play.
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
