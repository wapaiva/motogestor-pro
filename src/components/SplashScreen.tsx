import { useState, useEffect } from "react";
import logo from "@/assets/logo-motogestor.png";

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const [fadeOut, setFadeOut] = useState(false);
  const [scaleIn, setScaleIn] = useState(false);

  useEffect(() => {
    // Start scale animation immediately
    setScaleIn(true);
    // Start fade out at 4.5s
    const timer1 = setTimeout(() => setFadeOut(true), 4500);
    // Finish at 5s
    const timer2 = setTimeout(() => onFinish(), 5000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated ring effect */}
        <div className="absolute inset-0 -m-8 animate-pulse-glow rounded-full opacity-30" />
        
        {/* Logo with premium animation */}
        <img
          src={logo}
          alt="MotoGestor Pro"
          className={`w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain drop-shadow-2xl rounded-3xl transition-all duration-700 ease-out ${
            scaleIn ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        />
        
        {/* Loading indicator */}
        <div className="flex gap-2 mt-4">
          <span className="w-2 h-2 rounded-full bg-primary animate-[bounce_0.6s_infinite_-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-[bounce_0.6s_infinite_-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-[bounce_0.6s_infinite]" />
        </div>
      </div>
    </div>
  );
}
