import { useState } from "react";
import { Plus, Trash2, Bike, CalendarIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { storage, Ride, formatCurrency, generateId, calcularCustoCombustivel, calcularLitrosGastos, calcularLucro, getAvgFuelPrice, isConsumptionConfigured, obterConsumoAtivo } from "@/lib/storage";
import { playHornSound } from "@/lib/sounds";
import { useNavigate } from "react-router-dom";
import SourceSelect, { RideSource } from "@/components/SourceSelect";
import { useAuth } from "@/context/AuthProvider";
import { addRideToFirestore, deleteRideFromFirestore } from "@/lib/firestore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const serviceTypes = [
  { value: "mototaxi", label: "Mototáxi" },
  { value: "entrega", label: "Entrega" },
  { value: "corrida", label: "Corrida" },
  { value: "passageiro", label: "Passageiro" },
  { value: "outro", label: "Outro" },
];



export default function Rides() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rides, setRides] = useState(storage.getRides());
  const [showForm, setShowForm] = useState(false);

  const profile = storage.getProfile();
  const isMotoRegistered = !!(profile.motoModel && profile.motoYear);
  const hasConsumption = isConsumptionConfigured();
  const avgFuelPrice = getAvgFuelPrice();
  const consumoAtivo = obterConsumoAtivo();

  const handleShowForm = () => {
    if (!isMotoRegistered) {
      toast.error("📋 Cadastro da moto necessário", {
        description: "Cadastre os dados da sua moto em Perfil → Minha Moto antes de registrar corridas.",
        action: { label: "Ir para Minha Moto", onClick: () => navigate("/perfil", { state: { scrollTo: "minha-moto" } }) },
        duration: 5000,
      });
      return;
    }
    if (!hasConsumption) {
      toast.error("⛽ Consumo (km/L) não informado", {
        description: "Preencha o consumo da sua moto para calcular custos reais.",
        action: { label: "Configurar", onClick: () => navigate("/perfil", { state: { scrollTo: "minha-moto" } }) },
        duration: 5000,
      });
      return;
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [type, setType] = useState<Ride["type"]>("entrega");
  const [amount, setAmount] = useState("");
  const [distance, setDistance] = useState("");
  const [platform, setPlatform] = useState<RideSource>("iFood");
  const [customSource, setCustomSource] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleAdd = () => {
    if (!amount || !distance) {
      toast.error("Preencha todos os campos obrigatórios (valor e distância).");
      return;
    }
    const ride: Ride = {
      id: generateId(),
      date: selectedDate.toISOString(),
      type,
      amount: parseFloat(amount),
      distance: parseFloat(distance) || 0,
      platform,
      customSource: platform === "Outro" ? customSource : undefined,
      notes,
    };
    storage.addRide(ride);
    if (user) {
      console.log("[Firestore] Salvando corrida para uid:", user.uid, "emailVerified:", user.emailVerified);
      addRideToFirestore(user.uid, ride)
        .then(() => console.log("[Firestore] ✅ Corrida sincronizada:", ride.id))
        .catch((e) => {
          console.error("[Firestore] ❌ addRide falhou:", e?.code, e?.message, e);
          toast.error(`Falha sync nuvem: ${e?.code || e?.message || "erro desconhecido"}`, {
            description: "Dados salvos localmente. Veja o console (F12) para detalhes.",
            duration: 6000,
          });
        });
    } else {
      console.warn("[Firestore] ⚠️ Usuário não autenticado — corrida salva apenas localmente (modo visitante)");
    }
    setRides(storage.getRides());
    setAmount("");
    setDistance("");
    setCustomSource("");
    setNotes("");
    setSelectedDate(new Date());
    setShowForm(false);
    playHornSound();
    toast.success("Corrida registrada com sucesso!");
  };

  const handleDelete = (id: string) => {
    storage.deleteRide(id);
    if (user) deleteRideFromFirestore(user.uid, id).catch(console.error);
    setRides(storage.getRides());
    toast.success("Registro removido");
  };

  const grouped = rides.reduce<Record<string, Ride[]>>((acc, r) => {
    const month = new Date(r.date).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    (acc[month] = acc[month] || []).push(r);
    return acc;
  }, {});

  const todayTotal = rides
    .filter(
      (r) => new Date(r.date).toDateString() === new Date().toDateString()
    )
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Corridas</h2>
          <p className="text-xs text-muted-foreground">
            Hoje: {formatCurrency(todayTotal)}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-4 mb-4 animate-fade-in space-y-3 relative z-10">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Data
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "w-full mt-1 flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground text-left",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }}
                  locale={ptBR}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Tipo de Serviço
            </label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {serviceTypes.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setType(s.value as Ride["type"])}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    type === s.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Valor (R$)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Distância (km)
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="0"
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Plataforma
            </label>
            <div className="mt-1">
              <SourceSelect value={platform} onChange={setPlatform} customValue={customSource} onCustomChange={setCustomSource} />
            </div>
          </div>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações (opcional)"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
          />
          <button
            onClick={handleAdd}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm"
          >
            Salvar Corrida
          </button>
        </div>
      )}

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Bike className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma corrida registrada</p>
          <p className="text-xs">Toque no + para adicionar</p>
        </div>
      )}

      {Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, items]) => (
          <div key={month} className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              {month}
            </h3>
            <div className="space-y-2">
              {items
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((r) => (
                  <div
                    key={r.id}
                    className="glass-card rounded-xl p-3 flex items-center justify-between animate-fade-in"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-card-foreground">
                          {formatCurrency(r.amount)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                          {r.platform === "Outro" && r.customSource ? r.customSource : r.platform}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {serviceTypes.find((s) => s.value === r.type)?.label} •{" "}
                        {r.distance} km •{" "}
                        {new Date(r.date).toLocaleDateString("pt-BR")}
                      </p>
                      {r.distance > 0 && consumoAtivo.valor > 0 && avgFuelPrice > 0 && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-warning">⛽ {formatCurrency(calcularCustoCombustivel(r.distance, consumoAtivo.valor, avgFuelPrice))}</span>
                          <span className="text-[10px] text-success">💰 {formatCurrency(calcularLucro(r.amount, calcularCustoCombustivel(r.distance, consumoAtivo.valor, avgFuelPrice)))}</span>
                          <span className="text-[10px] text-muted-foreground">{calcularLitrosGastos(r.distance, consumoAtivo.valor).toFixed(2)}L</span>
                          <span className={`text-[8px] px-1 py-0.5 rounded ${consumoAtivo.modo === "real" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                            {consumoAtivo.modo === "real" ? "Real" : "Estimado"}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}

      <button
        onClick={handleShowForm}
        className="fixed bottom-20 right-4 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
