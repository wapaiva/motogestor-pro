import { Home, Bike, Wallet, BarChart3, Trophy, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/corridas", icon: Bike, label: "Corridas" },
  { path: "/gastos", icon: Wallet, label: "Gastos" },
  { path: "/conquistas", icon: Trophy, label: "Conquistas" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                active ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative ${active ? "animate-scale-in" : ""}`}>
                <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
                {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
              </div>
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
