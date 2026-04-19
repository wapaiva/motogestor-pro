import { useRef, useState } from "react";
import { Camera, Trash2, BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadAvatar, deleteAvatar, compressImage } from "@/lib/storage-firebase";
import { updateProfile, getFirebaseAuth } from "@/lib/firebase";
import { saveProfileToFirestore } from "@/lib/firestore";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/lib/storage";

interface ProfileHeaderProps {
  user: User | null;
  profile: UserProfile;
  onAvatarChange: (url: string | null) => void;
}

export default function ProfileHeader({ user, profile, onAvatarChange }: ProfileHeaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const displayName = user?.displayName || profile.name || "Usuário";
  const initials = (displayName || user?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleFile = async (file: File | undefined) => {
    if (!file || !user) return;
    setBusy(true);
    try {
      const compressed = await compressImage(file, 512, 0.85);
      const url = await uploadAvatar(user.uid, compressed);
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
      await saveProfileToFirestore(user.uid, { ...profile, photoURL: url } as any);
      onAvatarChange(url);
      toast.success("Foto atualizada!");
      setOpen(false);
    } catch (err: any) {
      console.error("[avatar upload]", err);
      toast.error(err?.message || "Não foi possível enviar a foto");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await deleteAvatar(user.uid);
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: "" });
      }
      await saveProfileToFirestore(user.uid, { ...profile, photoURL: "" } as any);
      onAvatarChange(null);
      toast.success("Foto removida");
      setOpen(false);
    } catch (err: any) {
      console.error("[avatar remove]", err);
      toast.error("Não foi possível remover a foto");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 mb-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="relative group"
              disabled={!user}
              aria-label="Alterar foto de perfil"
            >
              <Avatar className="h-16 w-16 border-2 border-primary/30">
                {user?.photoURL ? <AvatarImage src={user.photoURL} alt={displayName} /> : null}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user && (
                <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Foto de perfil</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <input
                ref={cameraInput}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button
                onClick={() => cameraInput.current?.click()}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                Tirar foto
              </button>
              <button
                onClick={() => fileInput.current?.click()}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium text-sm disabled:opacity-50"
              >
                Escolher da galeria
              </button>
              {user?.photoURL && (
                <button
                  onClick={handleRemove}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive py-2.5 rounded-lg font-medium text-sm disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Remover foto
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-foreground truncate">{displayName}</h2>
            {user?.emailVerified && (
              <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" aria-label="E-mail verificado" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user?.email || "Modo visitante"}</p>
          {(profile.serviceType || profile.city) && (
            <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
              {[profile.serviceType, profile.city].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
