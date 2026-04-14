import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { getThemeMode, setThemeMode, ThemeMode } from "@/lib/theme";

const modes: { value: ThemeMode; icon: React.ElementType; label: string }[] = [
  { value: "light", icon: Sun, label: "Claro" },
  { value: "dark", icon: Moon, label: "Escuro" },
];

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(getThemeMode());

  const handleChange = (m: ThemeMode) => {
    setMode(m);
    setThemeMode(m);
  };

  return (
    <div className="flex gap-1.5">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => handleChange(m.value)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === m.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <m.icon className="w-3.5 h-3.5" />
          {m.label}
        </button>
      ))}
    </div>
  );
}
