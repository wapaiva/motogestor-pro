import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { User } from "firebase/auth";
import { storage, formatCurrency, type UserProfile } from "@/lib/storage";
import { saveProfileToFirestore } from "@/lib/firestore";
import { playSuccessSound } from "@/lib/sounds";

const inputClass = "w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground";
const labelClass = "text-xs font-medium text-muted-foreground";

interface Props {
  user: User | null;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

export default function MotoTab({ user, profile, setProfile }: Props) {
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!profile.motoModel.trim()) { toast.error("Informe o modelo da moto"); return; }
    if (!profile.motoYear.trim()) { toast.error("Informe o ano da moto"); return; }
    if (profile.expectedConsumption <= 0) { toast.error("Consumo (km/L) deve ser maior que zero"); return; }
    setSaving(true);
    try {
      storage.saveProfile(profile);
      if (user) await saveProfileToFirestore(user.uid, profile);
      playSuccessSound();
      toast.success("Dados atualizados com sucesso");
    } catch (err) {
      console.error("[saveMoto]", err);
      toast.error("Salvo localmente. Falha ao sincronizar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in space-y-3">
      <div>
        <label className={labelClass}>Modelo <span className="text-destructive">*</span></label>
        <input value={profile.motoModel} onChange={(e) => setProfile({ ...profile, motoModel: e.target.value })} className={inputClass} placeholder="Ex: Honda CG 160" />
        {!profile.motoModel && <p className="text-[10px] text-destructive mt-0.5">Campo obrigatório</p>}
      </div>
      <div>
        <label className={labelClass}>Ano <span className="text-destructive">*</span></label>
        <input value={profile.motoYear} onChange={(e) => setProfile({ ...profile, motoYear: e.target.value })} className={inputClass} placeholder="Ex: 2023" />
        {!profile.motoYear && <p className="text-[10px] text-destructive mt-0.5">Campo obrigatório</p>}
      </div>
      <div>
        <label className={labelClass}>Placa (opcional)</label>
        <input value={profile.motoPlate} onChange={(e) => setProfile({ ...profile, motoPlate: e.target.value })} className={inputClass} placeholder="ABC-1234" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>KM Atual <span className="text-destructive">*</span></label>
          <input type="number" value={profile.currentKm || ""} onChange={(e) => setProfile({ ...profile, currentKm: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>Consumo (km/L) <span className="text-destructive">*</span></label>
          <input type="number" value={profile.expectedConsumption || ""} onChange={(e) => setProfile({ ...profile, expectedConsumption: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={inputClass} placeholder="0" />
          <p className="text-[10px] text-muted-foreground mt-0.5">Informe quantos km sua moto faz por litro</p>
          {profile.expectedConsumption <= 0 && <p className="text-[10px] text-destructive mt-0.5">Deve ser maior que zero</p>}
        </div>
      </div>
      {profile.expectedConsumption > 0 && (
        <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
          <p className="text-[10px] text-muted-foreground">
            Custo estimado por km:{" "}
            <span className="font-semibold text-card-foreground">
              {(() => {
                const fuel = storage.getFuel();
                if (fuel.length === 0) return "Cadastre abastecimentos";
                const recent = [...fuel].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
                const avgPrice = recent.reduce((s, f) => s + (f.amount / f.liters), 0) / recent.length;
                return formatCurrency(avgPrice / profile.expectedConsumption) + "/km";
              })()}
            </span>
          </p>
        </div>
      )}
      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        Salvar
      </button>
    </div>
  );
}
