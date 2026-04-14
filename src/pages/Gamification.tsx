import { useMemo } from "react";
import { Trophy, Star, Flame, Target, Zap, Award, TrendingUp, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { calculateGamification, getXpProgress, getLevelTitle, type Badge } from "@/lib/gamification";

const CATEGORY_LABELS: Record<string, { label: string; icon: typeof Trophy }> = {
  corridas: { label: "Corridas", icon: Trophy },
  ganhos: { label: "Ganhos", icon: TrendingUp },
  economia: { label: "Economia", icon: Target },
  dedicacao: { label: "Dedicação", icon: Flame },
};

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className={`premium-card p-3 flex items-center gap-3 animate-fade-in ${!badge.unlocked ? "opacity-50 grayscale" : "hover-lift"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${badge.unlocked ? "bg-primary/10" : "bg-secondary"}`}>
        {badge.unlocked ? badge.icon : <Lock className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-card-foreground truncate">{badge.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{badge.description}</p>
      </div>
      {badge.unlocked && <Star className="w-4 h-4 text-warning flex-shrink-0" />}
    </div>
  );
}

export default function Gamification() {
  const data = useMemo(() => calculateGamification(), []);
  const xpProgress = useMemo(() => getXpProgress(data.xp), [data.xp]);
  const title = getLevelTitle(data.level);

  const unlockedCount = data.badges.filter(b => b.unlocked).length;
  const totalCount = data.badges.length;

  const groupedBadges = useMemo(() => {
    const groups: Record<string, Badge[]> = {};
    data.badges.forEach(b => {
      if (!groups[b.category]) groups[b.category] = [];
      groups[b.category].push(b);
    });
    return groups;
  }, [data.badges]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-foreground mb-4">Conquistas</h2>

      {/* Level Card */}
      <div className="premium-card p-5 mb-5 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl gradient-success flex items-center justify-center">
            <span className="text-2xl font-extrabold text-success-foreground">{data.level}</span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Nível</p>
            <h3 className="text-base font-bold text-card-foreground">{title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Zap className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs text-muted-foreground">{data.xp} MTG total</span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-muted-foreground">Próximo nível</span>
            <span className="text-[10px] font-semibold text-primary">{xpProgress.current}/{xpProgress.needed} MTG</span>
          </div>
          <Progress value={xpProgress.pct} className="h-2.5" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="premium-card p-3 text-center animate-fade-in">
          <Flame className="w-5 h-5 mx-auto mb-1 text-warning" />
          <p className="text-lg font-bold text-card-foreground">{data.streakDays}</p>
          <p className="text-[10px] text-muted-foreground">Dias seguidos</p>
        </div>
        <div className="premium-card p-3 text-center animate-fade-in">
          <Award className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold text-card-foreground">{unlockedCount}</p>
          <p className="text-[10px] text-muted-foreground">Conquistados</p>
        </div>
        <div className="premium-card p-3 text-center animate-fade-in">
          <Trophy className="w-5 h-5 mx-auto mb-1 text-accent" />
          <p className="text-lg font-bold text-card-foreground">{totalCount}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Badges by Category */}
      {Object.entries(groupedBadges).map(([category, badges]) => {
        const cat = CATEGORY_LABELS[category];
        const Icon = cat?.icon || Trophy;
        return (
          <div key={category} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <Icon className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {cat?.label || category}
              </h3>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {badges.filter(b => b.unlocked).length}/{badges.length}
              </span>
            </div>
            <div className="space-y-2">
              {badges.map(b => <BadgeCard key={b.id} badge={b} />)}
            </div>
          </div>
        );
      })}

      <p className="text-[10px] text-muted-foreground text-center mt-4 mb-2">
        Continue registrando corridas para desbloquear mais conquistas e acumular pontos MTG!
      </p>
    </div>
  );
}
