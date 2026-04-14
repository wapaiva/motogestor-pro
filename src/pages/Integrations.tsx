import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Info, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { storage, generateId, Ride } from "@/lib/storage";
import { playSuccessSound } from "@/lib/sounds";

const platforms = [
  { id: "uber", name: "Uber", color: "#000000", csv: "Configurações > Privacidade > Baixar seus dados" },
  { id: "99", name: "99", color: "#FFCC00", csv: "Menu > Histórico > Exportar relatório" },
  { id: "ifood", name: "iFood", color: "#EA1D2C", csv: "Perfil > Relatórios > Exportar CSV" },
  { id: "rappi", name: "Rappi", color: "#FF441F", csv: "Conta > Histórico > Baixar relatório" },
  { id: "uairango", name: "UaiRango", color: "#FF6B00", csv: "Configurações > Relatórios > Exportar" },
  { id: "motosj", name: "Moto SJ", color: "#1E88E5", csv: "Menu > Corridas > Exportar dados" },
  { id: "pedemoto", name: "Pedemoto", color: "#7B1FA2", csv: "Perfil > Relatório > Baixar CSV" },
];

export default function Integrations() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").slice(1);
        let count = 0;
        for (const line of lines) {
          const parts = line.split(",");
          if (parts.length >= 3) {
            const ride: Ride = {
              id: generateId(),
              date: new Date(parts[0]?.trim() || Date.now()).toISOString(),
              type: "corrida",
              amount: parseFloat(parts[1]?.trim()) || 0,
              distance: parseFloat(parts[2]?.trim()) || 0,
              platform: selectedPlatform || parts[3]?.trim() || "Importado",
            };
            if (ride.amount > 0) {
              storage.addRide(ride);
              count++;
            }
          }
        }
        playSuccessSound();
        toast.success(`${count} corridas importadas com sucesso!`);
        setSelectedPlatform(null);
      } catch {
        toast.error("Erro ao processar arquivo CSV");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImportForPlatform = (platformName: string) => {
    setSelectedPlatform(platformName);
    fileRef.current?.click();
  };

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-foreground mb-1">Conectar Aplicativos</h2>
      <p className="text-xs text-muted-foreground mb-4">Integre suas plataformas de trabalho</p>

      <div className="glass-card rounded-xl p-3 mb-4 animate-fade-in flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          A integração com plataformas de corrida e entrega é feita via <strong className="text-foreground">importação manual de CSV/relatórios</strong> que cada app exporta.
        </p>
      </div>

      <h3 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-primary" /> Plataformas Disponíveis
      </h3>
      <div className="space-y-2 mb-6">
        {platforms.map((p) => (
          <div key={p.id} className="glass-card rounded-xl p-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[hsl(0,0%,100%)] text-sm" style={{ backgroundColor: p.color }}>
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">Importação via CSV</p>
                </div>
              </div>
              <button onClick={() => handleImportForPlatform(p.name)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Importar
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 pl-[52px]">Como exportar: {p.csv}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" /> Importar CSV Genérico
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Formato esperado: <strong>Data, Valor, Distância, Plataforma</strong> (uma corrida por linha, com cabeçalho)
        </p>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
        <button onClick={() => { setSelectedPlatform(null); fileRef.current?.click(); }} className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2.5 rounded-lg text-sm font-medium">
          <Upload className="w-4 h-4" /> Selecionar Arquivo CSV
        </button>
      </div>

      <div className="mt-4 glass-card rounded-xl p-4 animate-fade-in">
        <h4 className="text-xs font-semibold text-card-foreground mb-1">Sincronização Automática (em breve)</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A leitura automática de notificações para capturar corridas em tempo real é um recurso nativo do Android e estará disponível na versão nativa do app (Google Play).
        </p>
      </div>
    </div>
  );
}
