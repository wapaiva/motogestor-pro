import { useState, useEffect } from "react";
import logo from "@/assets/logo-motogestor.png";

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");

  useEffect(() => {
    // Enter animation completes
    const t1 = setTimeout(() => setPhase("visible"), 800);
    // Start exit at 5.2s
    const t2 = setTimeout(() => setPhase("exit"), 5200);
    // Finish at 6s
    const t3 = setTimeout(() => onFinish(), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-800 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: "800ms" }}
    >
      {/* Pulsing glow ring */}
      <div
        className={`absolute rounded-full transition-all duration-1000 ease-out ${
          phase === "enter"
            ? "w-0 h-0 opacity-0"
            : phase === "visible"
            ? "w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 opacity-100"
            : "w-[30rem] h-[30rem] opacity-0"
        }`}
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          animation: phase === "visible" ? "splash-glow 2.5s ease-in-out infinite" : "none",
        }}
      />

      {/* Logo */}
      <img
        src={logo}
        alt="MotoGestor Pro"
        className={`relative z-10 object-contain rounded-3xl transition-all ease-out ${
          phase === "enter"
            ? "w-16 h-16 opacity-0 scale-[0.3]"
            : phase === "visible"
            ? "w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 opacity-100 scale-100"
            : "w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 opacity-0 scale-110"
        }`}
        style={{
          transitionDuration: phase === "enter" ? "800ms" : "800ms",
          filter: phase === "visible" ? "drop-shadow(0 0 24px hsl(var(--primary) / 0.3))" : "none",
        }}
      />

      <style>{`
        @keyframes splash-glow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
