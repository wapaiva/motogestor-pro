import { useEffect, useState } from "react";
import { Plus, Trash2, Fuel, Wrench, AlertTriangle, CalendarIcon, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  storage,
  formatCurrency,
  generateId,
  FuelEntry,
  MaintenanceEntry,
  Expense,
  validarAbastecimento,
  getConsumoReal,
} from "@/lib/storage";
import { playHornSound } from "@/lib/sounds";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/context/AuthProvider";
import {
  addFuelToFirestore, deleteFuelFromFirestore,
  addMaintenanceToFirestore, deleteMaintenanceFromFirestore,
  addExpenseToFirestore, deleteExpenseFromFirestore,
} from "@/lib/firestore";

type Tab = "combustivel" | "manutencao" | "extras";

const maintenanceTypes = ["Óleo", "Pneu", "Freio", "Corrente", "Revisão", "Elétrica", "Outro"];
const expenseCategories = [
  { value: "multa", label: "Multa" },
  { value: "seguro", label: "Seguro" },
  { value: "documentacao", label: "Documentação" },
  { value: "ipva", label: "IPVA" },
  { value: "lavagem", label: "Lavagem" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "outro", label: "Outro" },
];

const inputClass = "w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground";

function DatePicker({ date, onSelect }: { date: Date; onSelect: (d: Date) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">Data</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="w-full mt-1 flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground text-left">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            {format(date, "dd/MM/yyyy", { locale: ptBR })}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => { if (d) { onSelect(d); setOpen(false); } }} locale={ptBR} className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function groupByMonth<T extends { date: string }>(items: T[]): Record<string, T[]> {
  return items
    .sort((a, b) => b.date.localeCompare(a.date))
    .reduce<Record<string, T[]>>((acc, item) => {
      const month = new Date(item.date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      (acc[month] = acc[month] || []).push(item);
      return acc;
    }, {});
}

export default function Expenses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("combustivel");
  const [fuel, setFuel] = useState(storage.getFuel());
  const [maint, setMaint] = useState(storage.getMaintenance());
  const [exp, setExp] = useState(storage.getExpenses());
  const [showForm, setShowForm] = useState(false);

  // Re-render when Firestore real-time sync updates localStorage or user changes
  useEffect(() => {
    const refresh = () => {
      setFuel(storage.getFuel());
      setMaint(storage.getMaintenance());
      setExp(storage.getExpenses());
    };
    window.addEventListener("mg:data-sync", refresh);
    window.addEventListener("mg:user-changed", refresh);
    return () => {
      window.removeEventListener("mg:data-sync", refresh);
      window.removeEventListener("mg:user-changed", refresh);
    };
  }, []);

  const profile = storage.getProfile();
  const isMotoRegistered = !!(profile.motoModel && profile.motoYear && profile.motoPlate);

  const handleShowForm = () => {
    if (!isMotoRegistered) {
      toast.error("📋 Cadastro da moto necessário", {
        description: "Para garantir a precisão das análises, cadastre os dados da sua moto em Perfil → Minha Moto antes de registrar gastos.",
        action: { label: "Ir para Minha Moto", onClick: () => navigate("/perfil", { state: { scrollTo: "minha-moto" } }) },
        duration: 5000,
      });
      return;
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [fuelDate, setFuelDate] = useState<Date>(new Date());
  const [maintDate, setMaintDate] = useState<Date>(new Date());
  const [expDate, setExpDate] = useState<Date>(new Date());

  const [fuelAmount, setFuelAmount] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelOdo, setFuelOdo] = useState("");
  const [fuelType, setFuelType] = useState<FuelEntry["fuelType"]>("gasolina");

  const [maintType, setMaintType] = useState("Óleo");
  const [maintAmount, setMaintAmount] = useState("");
  const [maintOdo, setMaintOdo] = useState("");
  const [maintNotes, setMaintNotes] = useState("");

  const [expCat, setExpCat] = useState<Expense["category"]>("multa");
  const [expAmount, setExpAmount] = useState("");
  const [expDesc, setExpDesc] = useState("");

  const addFuel = () => {
    if (!fuelAmount || !fuelLiters || !fuelOdo) {
      toast.error("Preencha todos os campos: valor, litros e KM atual.");
      return;
    }
    const liters = parseFloat(fuelLiters);
    const odo = parseFloat(fuelOdo);
    const amount = parseFloat(fuelAmount);
    if (liters <= 0) { toast.error("Litros deve ser maior que 0."); return; }
    if (amount <= 0) { toast.error("Valor deve ser maior que 0."); return; }
    if (odo < 0) { toast.error("KM deve ser maior ou igual a 0."); return; }
    
    const validation = validarAbastecimento(odo);
    if (!validation.valid) { toast.error(validation.message!); return; }

    const entry: FuelEntry = { id: generateId(), date: fuelDate.toISOString(), amount, liters, odometer: odo, fuelType };
    storage.addFuel(entry);
    if (user) addFuelToFirestore(user.uid, entry).catch((e) => { console.error("[Firestore] addFuel falhou:", e); toast.error("Falha ao sincronizar abastecimento. Dados salvos localmente."); });
    setFuel(storage.getFuel());
    setFuelAmount(""); setFuelLiters(""); setFuelOdo(""); setFuelDate(new Date());
    setShowForm(false); playHornSound();
    
    const consumoReal = getConsumoReal();
    if (consumoReal !== null) {
      toast.success(`Abastecimento registrado! Consumo real: ${consumoReal.toFixed(1)} km/L`);
    } else {
      toast.success("Abastecimento registrado! Adicione mais um para calcular consumo real.");
    }
  };

  const addMaint = () => {
    if (!maintAmount || !maintOdo) {
      toast.error("Preencha todos os campos: valor e KM atual.");
      return;
    }
    const entry: MaintenanceEntry = { id: generateId(), date: maintDate.toISOString(), type: maintType, amount: parseFloat(maintAmount), odometer: parseFloat(maintOdo) || 0, notes: maintNotes };
    storage.addMaintenance(entry);
    if (user) addMaintenanceToFirestore(user.uid, entry).catch((e) => { console.error("[Firestore] addMaintenance falhou:", e); toast.error("Falha ao sincronizar manutenção. Dados salvos localmente."); });
    setMaint(storage.getMaintenance());
    setMaintAmount(""); setMaintOdo(""); setMaintNotes(""); setMaintDate(new Date());
    setShowForm(false); playHornSound(); toast.success("Manutenção registrada!");
  };

  const addExp = () => {
    if (!expAmount || !expDesc) {
      toast.error("Preencha todos os campos: valor e descrição.");
      return;
    }
    const entry: Expense = { id: generateId(), date: expDate.toISOString(), category: expCat, amount: parseFloat(expAmount), description: expDesc };
    storage.addExpense(entry);
    if (user) addExpenseToFirestore(user.uid, entry).catch((e) => { console.error("[Firestore] addExpense falhou:", e); toast.error("Falha ao sincronizar despesa. Dados salvos localmente."); });
    setExp(storage.getExpenses());
    setExpAmount(""); setExpDesc(""); setExpDate(new Date());
    setShowForm(false); playHornSound(); toast.success("Despesa registrada!");
  };

  const tabs = [
    { key: "combustivel" as Tab, label: "Combustível", icon: Fuel },
    { key: "manutencao" as Tab, label: "Manutenção", icon: Wrench },
    { key: "extras" as Tab, label: "Extras", icon: AlertTriangle },
  ];

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-foreground mb-4">Gastos</h2>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setShowForm(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Fuel Tab */}
      {tab === "combustivel" && (
        <>
          {showForm && (
            <div className="glass-card rounded-xl p-4 mb-4 animate-fade-in space-y-3">
              <DatePicker date={fuelDate} onSelect={setFuelDate} />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Valor (R$)</label>
                  <input type="number" value={fuelAmount} onChange={(e) => setFuelAmount(e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Litros</label>
                  <input type="number" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">KM Atual</label>
                  <input type="number" value={fuelOdo} onChange={(e) => setFuelOdo(e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Tipo</label>
                  <div className="flex gap-1.5 mt-1">
                    {(["gasolina", "etanol"] as const).map((t) => (
                      <button key={t} onClick={() => setFuelType(t)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium ${fuelType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        {t === "gasolina" ? "Gasolina" : "Etanol"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={addFuel} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm">Salvar</button>
            </div>
          )}
          {fuel.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Fuel className="w-12 h-12 mx-auto mb-3 opacity-40" /><p className="text-sm">Nenhum abastecimento</p></div>
          ) : Object.entries(groupByMonth(fuel)).map(([month, items]) => (
            <div key={month} className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{month}</h3>
              {items.map((f) => (
                <div key={f.id} className="glass-card rounded-xl p-3 mb-2 flex justify-between items-center animate-fade-in">
                  <div>
                    <span className="text-sm font-semibold text-card-foreground">{formatCurrency(f.amount)}</span>
                    <p className="text-[10px] text-muted-foreground">{f.liters}L {f.fuelType} • {f.odometer} km • {new Date(f.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <button onClick={() => { storage.deleteFuel(f.id); if (user) deleteFuelFromFirestore(user.uid, f.id).catch(console.error); setFuel(storage.getFuel()); toast.success("Removido"); }} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Maintenance Tab */}
      {tab === "manutencao" && (
        <>
          {showForm && (
            <div className="glass-card rounded-xl p-4 mb-4 animate-fade-in space-y-3">
              <DatePicker date={maintDate} onSelect={setMaintDate} />
              <div><label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {maintenanceTypes.map((t) => (
                    <button key={t} onClick={() => setMaintType(t)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${maintType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Valor (R$)</label>
                  <input type="number" value={maintAmount} onChange={(e) => setMaintAmount(e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs font-medium text-muted-foreground">KM Atual</label>
                  <input type="number" value={maintOdo} onChange={(e) => setMaintOdo(e.target.value)} className={inputClass} /></div>
              </div>
              <input value={maintNotes} onChange={(e) => setMaintNotes(e.target.value)} placeholder="Observações" className={inputClass} />
              <button onClick={addMaint} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm">Salvar</button>
            </div>
          )}
          {maint.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Wrench className="w-12 h-12 mx-auto mb-3 opacity-40" /><p className="text-sm">Nenhuma manutenção</p></div>
          ) : Object.entries(groupByMonth(maint)).map(([month, items]) => (
            <div key={month} className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{month}</h3>
              {items.map((m) => (
                <div key={m.id} className="glass-card rounded-xl p-3 mb-2 flex justify-between items-center animate-fade-in">
                  <div><span className="text-sm font-semibold text-card-foreground">{formatCurrency(m.amount)}</span>
                    <p className="text-[10px] text-muted-foreground">{m.type} • {m.odometer} km • {new Date(m.date).toLocaleDateString("pt-BR")}</p></div>
                  <button onClick={() => { storage.deleteMaintenance(m.id); if (user) deleteMaintenanceFromFirestore(user.uid, m.id).catch(console.error); setMaint(storage.getMaintenance()); toast.success("Removido"); }} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Extras Tab */}
      {tab === "extras" && (
        <>
          {showForm && (
            <div className="glass-card rounded-xl p-4 mb-4 animate-fade-in space-y-3">
              <DatePicker date={expDate} onSelect={setExpDate} />
              <div><label className="text-xs font-medium text-muted-foreground">Categoria</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {expenseCategories.map((c) => (
                    <button key={c.value} onClick={() => setExpCat(c.value as Expense["category"])}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${expCat === c.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{c.label}</button>
                  ))}
                </div>
              </div>
              <input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="Valor (R$)" className={inputClass} />
              <input value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="Descrição" className={inputClass} />
              <button onClick={addExp} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm">Salvar</button>
            </div>
          )}
          {exp.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-40" /><p className="text-sm">Nenhuma despesa extra</p></div>
          ) : Object.entries(groupByMonth(exp)).map(([month, items]) => (
            <div key={month} className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{month}</h3>
              {items.map((e) => (
                <div key={e.id} className="glass-card rounded-xl p-3 mb-2 flex justify-between items-center animate-fade-in">
                  <div><span className="text-sm font-semibold text-card-foreground">{formatCurrency(e.amount)}</span>
                    <p className="text-[10px] text-muted-foreground">{expenseCategories.find((c) => c.value === e.category)?.label} • {e.description} • {new Date(e.date).toLocaleDateString("pt-BR")}</p></div>
                  <button onClick={() => { storage.deleteExpense(e.id); if (user) deleteExpenseFromFirestore(user.uid, e.id).catch(console.error); setExp(storage.getExpenses()); toast.success("Removido"); }} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      <button onClick={handleShowForm} className="fixed bottom-20 right-4 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-40">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
