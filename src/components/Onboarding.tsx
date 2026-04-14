import { useState, useEffect } from "react";
import { Bike, BarChart3, Wallet, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Bike,
    title: "Registre suas Corridas",
    description:
      "Adicione cada corrida com valor, distância e plataforma. Acompanhe tudo organizado.",
  },
  {
    icon: Wallet,
    title: "Controle seus Gastos",
    description:
      "Registre combustível, manutenção e despesas extras para saber exatamente quanto gasta.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Inteligentes",
    description:
      "Veja gráficos e análises detalhadas do seu desempenho financeiro diário, semanal e mensal.",
  },
  {
    icon: TrendingUp,
    title: "Aumente seus Lucros",
    description:
      "Defina metas, acompanhe o lucro líquido e receba insights para ganhar mais.",
  },
];

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("mg_onboarding_done");
    if (!seen) setShow(true);
  }, []);

  const finish = () => {
    localStorage.setItem("mg_onboarding_done", "true");
    setShow(false);
  };

  if (!show) return null;

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[99] bg-black/70 flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
          <Icon className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-lg font-bold text-card-foreground">
          {current.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {current.description}
        </p>

        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium"
            >
              Voltar
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={finish}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
            >
              Começar!
            </button>
          )}
        </div>

        <button
          onClick={finish}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Pular introdução
        </button>
      </div>
    </div>
  );
}
