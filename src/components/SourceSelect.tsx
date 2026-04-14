import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type RideSource =
  | "Uber"
  | "99"
  | "iFood"
  | "Rappi"
  | "UaiRango"
  | "MotoSJ"
  | "Pedemoto"
  | "Particular"
  | "Outro";

interface SourceDef {
  id: RideSource;
  label: string;
}

const sources: SourceDef[] = [
  { id: "Uber", label: "Uber" },
  { id: "99", label: "99" },
  { id: "iFood", label: "iFood" },
  { id: "Rappi", label: "Rappi" },
  { id: "UaiRango", label: "UaiRango" },
  { id: "MotoSJ", label: "Moto SJ" },
  { id: "Pedemoto", label: "Pedemoto" },
  { id: "Particular", label: "Particular" },
  { id: "Outro", label: "Outro" },
];

interface Props {
  value: string;
  onChange: (v: RideSource) => void;
  customValue?: string;
  onCustomChange?: (v: string) => void;
}

export default function SourceSelect({ value, onChange, customValue, onCustomChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = sources.find((s) => s.id === value);

  return (
    <div className="space-y-2">
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? selected.label : "Selecione a plataforma"}
          </span>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 z-[9999] animate-fade-in">
            <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
              {sources.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onChange(s.id); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-sm text-left transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl",
                    value === s.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-secondary/80"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {value === "Outro" && onCustomChange && (
        <input
          type="text"
          value={customValue || ""}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Nome da plataforma..."
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground animate-fade-in"
        />
      )}
    </div>
  );
}

export { sources };
