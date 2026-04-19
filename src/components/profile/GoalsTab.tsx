import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { User } from "firebase/auth";
import { storage, type Goals } from "@/lib/storage";
import { saveGoalsToFirestore } from "@/lib/firestore";
import { playSuccessSound } from "@/lib/sounds";

const inputClass = "w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground";
const labelClass = "text-xs font-medium text-muted-foreground";

interface Props {
  user: User | null;
  goals: Goals;
  setGoals: (g: Goals) => void;
}

export default function GoalsTab({ user, goals, setGoals }: Props) {
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      storage.saveGoals(goals);
      if (user) await saveGoalsToFirestore(user.uid, goals);
      playSuccessSound();
      toast.success("Metas salvas com sucesso");
    } catch {
      toast.error("Salvo localmente. Falha ao sincronizar.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in space-y-3">
      <div><label className={labelClass}>Meta Diária (R$)</label><input type="number" value={goals.daily || ""} onChange={(e) => setGoals({ ...goals, daily: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" /></div>
      <div><label className={labelClass}>Meta Semanal (R$)</label><input type="number" value={goals.weekly || ""} onChange={(e) => setGoals({ ...goals, weekly: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" /></div>
      <div><label className={labelClass}>Meta Mensal (R$)</label><input type="number" value={goals.monthly || ""} onChange={(e) => setGoals({ ...goals, monthly: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" /></div>
      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        Salvar Metas
      </button>
    </div>
  );
}
