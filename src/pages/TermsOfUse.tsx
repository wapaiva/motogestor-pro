import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUPPORT_EMAIL = "suporte.motogestorpro@gmail.com";

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <h2 className="text-lg font-bold text-foreground mb-4">Termos de Uso</h2>
      <div className="glass-card rounded-xl p-4 space-y-4 animate-fade-in">
        <section><h3 className="text-sm font-semibold text-card-foreground mb-1">1. Aceitação</h3><p className="text-xs text-muted-foreground leading-relaxed">Ao usar o MotoGestor Pro, você concorda com estes termos.</p></section>
        <section><h3 className="text-sm font-semibold text-card-foreground mb-1">2. Uso do App</h3><p className="text-xs text-muted-foreground leading-relaxed">O MotoGestor Pro é uma ferramenta de controle financeiro pessoal para profissionais de transporte por moto. Os cálculos são informativos e não substituem consultoria contábil profissional.</p></section>
        <section><h3 className="text-sm font-semibold text-card-foreground mb-1">3. Responsabilidade</h3><p className="text-xs text-muted-foreground leading-relaxed">O usuário é responsável pela veracidade dos dados inseridos. Não nos responsabilizamos por decisões financeiras baseadas nos relatórios do app.</p></section>
        <section><h3 className="text-sm font-semibold text-card-foreground mb-1">4. Versão Premium</h3><p className="text-xs text-muted-foreground leading-relaxed">A assinatura premium remove anúncios e libera funcionalidades adicionais. Pagamentos são processados via Google Play.</p></section>
        <section><h3 className="text-sm font-semibold text-card-foreground mb-1">5. Anúncios</h3><p className="text-xs text-muted-foreground leading-relaxed">A versão gratuita exibe anúncios. Eles são fornecidos por parceiros (Google AdMob) e não representam recomendação nossa.</p></section>
        <section><h3 className="text-sm font-semibold text-card-foreground mb-1">6. Dados</h3><p className="text-xs text-muted-foreground leading-relaxed">Seus dados são armazenados localmente. Backups são de responsabilidade do usuário.</p></section>
        <section><h3 className="text-sm font-semibold text-card-foreground mb-1">7. Modificações</h3><p className="text-xs text-muted-foreground leading-relaxed">Podemos atualizar estes termos. Notificaremos sobre mudanças significativas.</p></section>
        <div className="border-t border-border pt-3"><p className="text-xs text-muted-foreground">Contato: <span className="text-primary font-medium">{SUPPORT_EMAIL}</span></p></div>
      </div>
    </div>
  );
}
