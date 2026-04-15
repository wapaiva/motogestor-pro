import { useState, useEffect } from "react";
import logo from "@/assets/logo-motogestor.png";

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const [fadeOut, setFadeOut] = useState(false);
  const [stage, setStage] = useState<"enter" | "pulse">("enter");

  useEffect(() => {
    // After entrance animation, start pulsing
    const t1 = setTimeout(() => setStage("pulse"), 1200);
    // Fade out at 5.3s
    const t2 = setTimeout(() => setFadeOut(true), 5300);
    // Finish at 6s
    const t3 = setTimeout(() => onFinish(), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Glow ring */}
      <div
        className={`absolute rounded-full transition-all duration-1000 ${
          stage === "pulse"
            ? "w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 animate-[linkedin-glow_2s_ease-in-out_infinite]"
            : "w-0 h-0 opacity-0"
        }`}
      />

      <img
        src={logo}
        alt="MotoGestor Pro"
        className={`relative z-10 rounded-3xl object-contain drop-shadow-2xl
          w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72
          ${stage === "enter"
            ? "animate-[linkedin-enter_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            : "animate-[linkedin-pulse_2s_ease-in-out_infinite]"
          }
          ${fadeOut ? "animate-[linkedin-exit_0.7s_ease-in_forwards]" : ""}
        `}
      />
    </div>
  );
}
