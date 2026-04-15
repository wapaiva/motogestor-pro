import { useState, useEffect } from "react";
import logo from "@/assets/logo-motogestor.png";

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1800);
    const timer2 = setTimeout(() => onFinish(), 2300);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={logo}
        alt="MotoGestor Pro"
        className="w-36 h-36 object-contain animate-fade-in drop-shadow-lg rounded-2xl"
      />
    </div>
  );
}
