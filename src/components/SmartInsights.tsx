import { useMemo, useEffect, useRef, useState } from "react";
import { AlertTriangle, TrendingDown, Fuel, Wrench, Zap, BarChart3 } from "lucide-react";
import { storage, formatCurrency, isThisWeek, isThisMonth, isToday, getAvgFuelPrice, obterConsumoAtivo, getConsumoReal } from "@/lib/storage";
import { playAlertSound } from "@/lib/sounds";

interface Insight {
  message: string;
  type: "warning" | "danger" | "tip";
  icon: React.ElementType;
}

export default function SmartInsights() {
  const soundPlayed = useRef(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("mg:data-sync", refresh);
    window.addEventListener("mg:user-changed", refresh);
    return () => {
      window.removeEventListener("mg:data-sync", refresh);
      window.removeEventListener("mg:user-changed", refresh);
    };
  }, []);

  const insights = useMemo(() => {
    const rides = storage.getRides();
    const fuel = storage.getFuel();
    const maintenance = storage.getMaintenance();
    const expenses = storage.getExpenses();
    const profile = storage.getProfile();
    const result: Insight[] = [];

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekEarnings = rides
      .filter((r) => new Date(r.date) >= weekStart)
      .reduce((s, r) => s + r.amount, 0);
    const lastWeekEarnings = rides
      .filter((r) => {
        const d = new Date(r.date);
        return d >= lastWeekStart && d < weekStart;
      })
      .reduce((s, r) => s + r.amount, 0);

    if (lastWeekEarnings > 0 && thisWeekEarnings < lastWeekEarnings * 0.85) {
      const pct = Math.round(
        (1 - thisWeekEarnings / lastWeekEarnings) * 100
      );
      result.push({
        message: `Seus ganhos caíram ${pct}% esta semana`,
        type: "warning",
        icon: TrendingDown,
      });
    }

    const thisMonthFuel = fuel
      .filter((f) => isThisMonth(f.date))
      .reduce((s, f) => s + f.amount, 0);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthFuel = fuel
      .filter((f) => {
        const d = new Date(f.date);
        return d >= lastMonth && d <= lastMonthEnd;
      })
      .reduce((s, f) => s + f.amount, 0);

    if (lastMonthFuel > 0 && thisMonthFuel > lastMonthFuel * 1.15) {
      const pct = Math.round((thisMonthFuel / lastMonthFuel - 1) * 100);
      result.push({
        message: `Gasto com combustível subiu ${pct}% este mês`,
        type: "danger",
        icon: Fuel,
      });
    }

    const thisWeekRides = rides.filter((r) => isThisWeek(r.date));
    const totalDist = thisWeekRides.reduce((s, r) => s + r.distance, 0);
    const thisWeekFuel = fuel
      .filter((f) => isThisWeek(f.date))
      .reduce((s, f) => s + f.amount, 0);
    if (totalDist > 0 && thisWeekFuel / totalDist > 0.5) {
      result.push({
        message: `Custo por km alto: ${formatCurrency(thisWeekFuel / totalDist)}/km`,
        type: "warning",
        icon: AlertTriangle,
      });
    }

    if (profile.currentKm > 0) {
      const lastOil = maintenance
        .filter((m) => m.type.toLowerCase().includes("óleo"))
        .sort((a, b) => b.odometer - a.odometer)[0];
      if (lastOil && profile.currentKm - lastOil.odometer >= 1800) {
        result.push({
          message: `Troca de óleo próxima (${profile.currentKm - lastOil.odometer} km)`,
          type: "warning",
          icon: Wrench,
        });
      }
    }

    const thisMonthEarnings = rides
      .filter((r) => isThisMonth(r.date))
      .reduce((s, r) => s + r.amount, 0);
    const thisMonthExpenses =
      thisMonthFuel +
      maintenance
        .filter((m) => isThisMonth(m.date))
        .reduce((s, m) => s + m.amount, 0) +
      expenses
        .filter((e) => isThisMonth(e.date))
        .reduce((s, e) => s + e.amount, 0);
    if (
      thisMonthEarnings > 0 &&
      thisMonthExpenses > thisMonthEarnings * 0.7
    ) {
      result.push({
        message: "Gastos representam mais de 70% dos ganhos",
        type: "danger",
        icon: TrendingDown,
      });
    }

    // Smart consumption insight with dual mode
    const consumo = obterConsumoAtivo();
    const consumoReal = getConsumoReal();
    
    if (consumoReal !== null && profile.expectedConsumption > 0) {
      const diff = ((profile.expectedConsumption - consumoReal) / profile.expectedConsumption) * 100;
      if (diff > 40) {
        result.push({
          message: `⚠️ Consumo real (${consumoReal.toFixed(1)} km/L) está ${diff.toFixed(0)}% pior que o esperado (${profile.expectedConsumption} km/L). Possível problema mecânico!`,
          type: "danger",
          icon: Wrench,
        });
      } else if (diff > 15) {
        result.push({
          message: `Consumo real (${consumoReal.toFixed(1)} km/L) está ${diff.toFixed(0)}% abaixo do esperado (${profile.expectedConsumption} km/L)`,
          type: "warning",
          icon: Fuel,
        });
      }
    } else if (consumoReal === null && fuel.length >= 1) {
      result.push({
        message: "Adicione mais um abastecimento para ativar o consumo real automático",
        type: "tip",
        icon: Fuel,
      });
    }

    // Cost per km alert using active consumption
    if (consumo.valor > 0) {
      const avgPrice = getAvgFuelPrice();
      if (avgPrice > 0) {
        const costPerKm = avgPrice / consumo.valor;
        if (costPerKm > 0.5) {
          result.push({
            message: `Custo de combustível: ${formatCurrency(costPerKm)}/km (${consumo.modo === "real" ? "real" : "estimado"})`,
            type: "tip",
            icon: Fuel,
          });
        }
      }
    }

    // Fuel spending trend alert
    const recentFuel = [...fuel].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    if (recentFuel.length >= 3) {
      const avgRecent = recentFuel.reduce((s, f) => s + (f.amount / f.liters), 0) / recentFuel.length;
      const olderFuel = [...fuel].sort((a, b) => b.date.localeCompare(a.date)).slice(3, 6);
      if (olderFuel.length >= 2) {
        const avgOlder = olderFuel.reduce((s, f) => s + (f.amount / f.liters), 0) / olderFuel.length;
        if (avgRecent > avgOlder * 1.1) {
          result.push({
            message: `Preço do combustível subiu ${((avgRecent / avgOlder - 1) * 100).toFixed(0)}% recentemente`,
            type: "warning",
            icon: AlertTriangle,
          });
        }
      }
    }

    if (rides.length >= 7) {
      const dayTotals: Record<number, { total: number; count: number }> = {};
      rides.forEach((r) => {
        const day = new Date(r.date).getDay();
        if (!dayTotals[day]) dayTotals[day] = { total: 0, count: 0 };
        dayTotals[day].total += r.amount;
        dayTotals[day].count++;
      });
      const best = Object.entries(dayTotals).sort(
        ([, a], [, b]) => b.total / b.count - a.total / a.count
      )[0];
      if (best) {
        const dayNames = [
          "Domingo",
          "Segunda",
          "Terça",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sábado",
        ];
        const avg =
          dayTotals[Number(best[0])].total /
          dayTotals[Number(best[0])].count;
        result.push({
          message: `${dayNames[Number(best[0])]} é seu melhor dia (média ${formatCurrency(avg)})`,
          type: "tip",
          icon: Zap,
        });
      }
    }

    // Platform comparison insight
    const todayRides = rides.filter((r) => isToday(r.date));
    if (todayRides.length >= 2) {
      const platformTotals: Record<string, number> = {};
      todayRides.forEach((r) => {
        const key = r.platform === "Outro" && r.customSource ? r.customSource : (r.platform || "Outro");
        platformTotals[key] = (platformTotals[key] || 0) + r.amount;
      });
      const sorted = Object.entries(platformTotals).sort((a, b) => b[1] - a[1]);
      if (sorted.length >= 1) {
        result.push({
          message: `Hoje você ganhou mais com ${sorted[0][0]} — ${formatCurrency(sorted[0][1])} 🚀`,
          type: "tip",
          icon: BarChart3,
        });
      }
      if (sorted.length >= 2) {
        result.push({
          message: `${sorted[0][0]} está rendendo mais que ${sorted[1][0]} hoje`,
          type: "tip",
          icon: Zap,
        });
      }
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    if (insights.some((i) => i.type === "danger") && !soundPlayed.current) {
      soundPlayed.current = true;
      playAlertSound();
    }
  }, [insights]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2 mb-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Insights Inteligentes
      </h3>
      {insights.map((insight, i) => (
        <div
          key={i}
          className={`premium-card p-3 flex items-start gap-2.5 animate-fade-in ${
            insight.type === "danger"
              ? "border-destructive/20"
              : insight.type === "tip"
                ? "border-primary/20"
                : "border-warning/20"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              insight.type === "danger"
                ? "bg-destructive/10"
                : insight.type === "tip"
                  ? "bg-primary/10"
                  : "bg-warning/10"
            }`}
          >
            <insight.icon
              className={`w-3.5 h-3.5 ${
                insight.type === "danger"
                  ? "text-destructive"
                  : insight.type === "tip"
                    ? "text-primary"
                    : "text-warning"
              }`}
            />
          </div>
          <p className="text-xs font-medium text-card-foreground leading-relaxed pt-1">
            {insight.message}
          </p>
        </div>
      ))}
    </div>
  );
}
