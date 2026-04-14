import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUPPORT_EMAIL = "suporte.motogestorpro@gmail.com";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <h2 className="text-lg font-bold text-foreground mb-4">Política de Privacidade</h2>
      <div className="glass-card rounded-xl p-4 space-y-4 animate-fade-in">
        <p className="text-xs text-primary font-semibold">MotoGestor Pro respeita sua privacidade e está em conformidade com a LGPD.</p>
        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">1. Dados Coletados</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Coletamos os seguintes dados, fornecidos voluntariamente:</p>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc ml-4 mt-1 space-y-0.5">
            <li>Nome e e-mail (para login e identificação)</li>
            <li>Dados financeiros (ganhos, gastos, corridas)</li>
            <li>Dados do veículo (modelo, placa, quilometragem)</li>
            <li>Cidade e tipo de serviço</li>
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">2. Como os Dados São Usados</h3>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc ml-4 mt-1 space-y-0.5">
            <li>Funcionamento das funcionalidades do aplicativo</li>
            <li>Geração de relatórios e análises financeiras</li>
            <li>Cálculo de metas e insights inteligentes</li>
            <li>Backup e restauração de dados</li>
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">3. Armazenamento e Segurança</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Seus dados financeiros são armazenados localmente no seu dispositivo. Todas as comunicações utilizam HTTPS.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">4. Compartilhamento com Terceiros</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Não vendemos nem compartilhamos seus dados pessoais, exceto quando exigido por lei ou para personalização de anúncios na versão gratuita.</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-card-foreground mb-1">5. Seus Direitos (LGPD)</h3>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc ml-4 mt-1 space-y-0.5">
            <li>Acessar seus dados pessoais a qualquer momento</li>
            <li>Solicitar correção ou exclusão de dados</li>
            <li>Revogar o consentimento de coleta</li>
            <li>Exportar seus dados (funcionalidade de backup)</li>
          </ul>
        </section>
        <div className="border-t border-border pt-3 space-y-1">
          <p className="text-xs text-card-foreground font-medium">Desenvolvedor: WC Tech Labs</p>
          <p className="text-xs text-muted-foreground">Contato: <span className="text-primary font-medium">{SUPPORT_EMAIL}</span></p>
          <p className="text-[10px] text-muted-foreground">Última atualização: Abril 2026</p>
        </div>
      </div>
    </div>
  );
}
