import { toast } from "sonner";
import { Database, Download, Trash2 } from "lucide-react";
import { storage, type UserProfile, type Goals } from "@/lib/storage";
import { playSuccessSound } from "@/lib/sounds";

interface Props {
  setProfile: (p: UserProfile) => void;
  setGoals: (g: Goals) => void;
}

export default function BackupTab({ setProfile, setGoals }: Props) {
  const exportBackup = () => {
    const data = {
      rides: storage.getRides(),
      fuel: storage.getFuel(),
      maintenance: storage.getMaintenance(),
      expenses: storage.getExpenses(),
      profile: storage.getProfile(),
      goals: storage.getGoals(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `motogestor_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSuccessSound();
    toast.success("Backup exportado!");
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.rides) storage.saveRides(data.rides);
        if (data.fuel) storage.saveFuel(data.fuel);
        if (data.maintenance) storage.saveMaintenance(data.maintenance);
        if (data.expenses) storage.saveExpenses(data.expenses);
        if (data.profile) storage.saveProfile(data.profile);
        if (data.goals) storage.saveGoals(data.goals);
        playSuccessSound();
        toast.success("Backup restaurado!");
        setProfile(storage.getProfile());
        setGoals(storage.getGoals());
      } catch {
        toast.error("Erro ao restaurar backup. Arquivo inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearAllData = () => {
    if (confirm("Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.")) {
      storage.saveRides([]); storage.saveFuel([]); storage.saveMaintenance([]); storage.saveExpenses([]);
      storage.saveProfile({ name: "", city: "", serviceType: "", motoModel: "", motoYear: "", motoPlate: "", currentKm: 0, expectedConsumption: 30 });
      storage.saveGoals({ daily: 200, weekly: 1200, monthly: 5000 });
      setProfile(storage.getProfile());
      setGoals(storage.getGoals());
      toast.success("Todos os dados foram apagados");
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" /> Backup e Dados
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Exporte seus dados para manter uma cópia de segurança ou restaure um backup anterior.
        </p>
      </div>
      <button onClick={exportBackup} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm">
        <Download className="w-4 h-4" /> Exportar Backup
      </button>
      <div>
        <input type="file" accept=".json" onChange={importBackup} className="hidden" id="import-backup" />
        <label htmlFor="import-backup" className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium text-sm cursor-pointer">
          <Database className="w-4 h-4" /> Restaurar Backup
        </label>
      </div>
      <div className="border-t border-border pt-3">
        <button onClick={clearAllData} className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive py-2.5 rounded-lg font-medium text-sm">
          <Trash2 className="w-4 h-4" /> Apagar Todos os Dados
        </button>
        <p className="text-[10px] text-muted-foreground mt-1 text-center">Esta ação não pode ser desfeita</p>
      </div>
    </div>
  );
}
