import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";
import type { User } from "firebase/auth";
import { storage, type UserProfile } from "@/lib/storage";
import { saveProfileToFirestore } from "@/lib/firestore";
import { playSuccessSound } from "@/lib/sounds";
import { detectCity } from "@/lib/geolocation";

const inputClass = "w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground";
const labelClass = "text-xs font-medium text-muted-foreground";

interface Props {
  user: User | null;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

export default function DataTab({ user, profile, setProfile }: Props) {
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      storage.saveProfile(profile);
      if (user) await saveProfileToFirestore(user.uid, profile);
      playSuccessSound();
      toast.success("Dados atualizados com sucesso");
    } catch (err: any) {
      console.error("[saveProfile]", err);
      toast.error("Salvo localmente. Falha ao sincronizar.");
    } finally {
      setSaving(false);
    }
  };

  const autoCity = async () => {
    setLocating(true);
    try {
      const city = await detectCity();
      if (city) {
        setProfile({ ...profile, city });
        toast.success(`Cidade detectada: ${city}`);
      } else {
        toast.error("Não foi possível detectar a cidade");
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in space-y-3">
      <div>
        <label className={labelClass}>Nome</label>
        <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} placeholder="Seu nome" />
      </div>
      <div>
        <label className={labelClass}>Cidade</label>
        <div className="flex gap-2 mt-1">
          <input
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
            placeholder="Sua cidade"
          />
          <button
            type="button"
            onClick={autoCity}
            disabled={locating}
            className="px-3 bg-secondary text-secondary-foreground rounded-lg flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
            aria-label="Detectar cidade"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className={labelClass}>Tipo de Serviço Principal</label>
        <input value={profile.serviceType} onChange={(e) => setProfile({ ...profile, serviceType: e.target.value })} className={inputClass} placeholder="Ex: Entregador" />
      </div>
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
