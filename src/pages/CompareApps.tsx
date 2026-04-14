import { useMemo, useState } from "react";
import { BarChart3, Trophy, TrendingUp, ArrowLeft, DollarSign, MapPin, AlertTriangle, Lightbulb, Filter, Bike } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList,
} from "recharts";
import { storage, formatCurrency, isToday, isThisWeek, isThisMonth } from "@/lib/storage";
import { useNavigate } from "react-router-dom";

const COLORS = [
  "hsl(0, 0%, 35%)",
  "hsl(48, 100%, 50%)",
  "hsl(0, 78%, 51%)",
  "hsl(14, 100%, 50%)",
  "hsl(35, 90%, 50%)",
  "hsl(210, 70%, 50%)",
  "hsl(270, 60%, 50%)",
  "hsl(152, 60%, 45%)",
  "hsl(215, 15%, 45%)",
];

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(222, 25%, 12%)",
  border: "1px solid hsl(222, 20%, 25%)",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(210, 20%, 95%)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  padding: "8px 12px",
};

type Period = "todos" | "hoje" | "7dias" | "30dias";

const PERIOD_LABELS: Record<Period, string> = {
  todos: "Todos",
  hoje: "Hoje",
  "7dias": "7 dias",
  "30dias": "30 dias",
};

function isLast7Days(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const ago = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  return d >= ago;
}

function isLast30Days(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const ago = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  return d >= ago;
}

export default function CompareApps() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("todos");

  const allRides = storage.getRides();
  const fuel = storage.getFuel();
  const maintenance = storage.getMaintenance();
  const expenses = storage.getExpenses();

  const filterFn = period === "hoje" ? isToday : period === "7dias" ? isLast7Days : period === "30dias" ? isLast30Days : () => true;

  const rides = useMemo(() => allRides.filter((r) => filterFn(r.date)), [allRides, period]);

  const totalExpenses = useMemo(() => {
    return (
      fuel.filter((f) => filterFn(f.date)).reduce((s, f) => s + f.amount, 0) +
      maintenance.filter((m) => filterFn(m.date)).reduce((s, m) => s + m.amount, 0) +
      expenses.filter((e) => filterFn(e.date)).reduce((s, e) => s + e.amount, 0)
    );
  }, [fuel, maintenance, expenses, period]);

  const platformData = useMemo(() => {
    const map: Record<string, { earnings: number; rides: number; distance: number }> = {};
    rides.forEach((r) => {
      const key = r.platform === "Outro" && (r as any).customSource ? (r as any).customSource : (r.platform || "Outro");
      if (!map[key]) map[key] = { earnings: 0, rides: 0, distance: 0 };
      map[key].earnings += r.amount;
      map[key].rides += 1;
      map[key].distance += r.distance;
    });

    const totalRides = rides.length;
    return Object.entries(map)
      .map(([name, d]) => {
        const expShare = totalRides > 0 ? totalExpenses * (d.rides / totalRides) : 0;
        return {
          name,
          ganhos: d.earnings,
          corridas: d.rides,
          distancia: d.distance,
          lucro: d.earnings - expShare,
          mediaCorrida: d.rides > 0 ? d.earnings / d.rides : 0,
          valorPorKm: d.distance > 0 ? d.earnings / d.distance : 0,
          lucroPorKm: d.distance > 0 ? (d.earnings - expShare) / d.distance : 0,
        };
      })
      .sort((a, b) => b.ganhos - a.ganhos);
  }, [rides, totalExpenses]);

  const bestApp = platformData[0];
  const bestPerKm = useMemo(() => {
    if (platformData.length === 0) return null;
    return [...platformData].sort((a, b) => b.valorPorKm - a.valorPorKm)[0];
  }, [platformData]);

  const mostRides = useMemo(() => {
    if (platformData.length === 0) return null;
    return [...platformData].sort((a, b) => b.corridas - a.corridas)[0];
  }, [platformData]);

  // Smart insights
  const insights = useMemo(() => {
    const msgs: { icon: React.ReactNode; text: string; type: "success" | "warning" | "info" }[] = [];
    if (platformData.length === 0) return msgs;

    // Low efficiency alert
    const lowEfficiency = platformData.find((p) => p.distancia > 0 && p.valorPorKm < 1 && p.corridas >= 2);
    if (lowEfficiency) {
      msgs.push({
        icon: <AlertTriangle className="w-4 h-4 text-warning" />,
        text: `Você rodou muito e lucrou pouco na ${lowEfficiency.name} (${formatCurrency(lowEfficiency.valorPorKm)}/km)`,
        type: "warning",
      });
    }

    // Suggestion
    if (bestPerKm && bestApp && bestPerKm.name !== bestApp.name) {
      msgs.push({
        icon: <Lightbulb className="w-4 h-4 text-primary" />,
        text: `${bestPerKm.name} paga melhor por km. Considere focar mais nela!`,
        type: "info",
      });
    }

    if (platformData.length >= 2) {
      const worst = [...platformData].sort((a, b) => a.valorPorKm - b.valorPorKm)[0];
      if (worst && worst.valorPorKm > 0) {
        msgs.push({
          icon: <Lightbulb className="w-4 h-4 text-primary" />,
          text: `Evite corridas longas com baixo retorno na ${worst.name}`,
          type: "info",
        });
      }
    }

    return msgs;
  }, [platformData, bestPerKm, bestApp]);

  const platformNames = ["Uber", "99", "iFood", "Rappi", "UaiRango", "MotoSJ", "Pedemoto", "Particular", "Outro"];
  const getColor = (name: string) => {
    const idx = platformNames.indexOf(name);
    return idx >= 0 ? COLORS[idx] : "hsl(215, 15%, 45%)";
  };

  const chartHeight = Math.max(platformData.length * 48, 120);

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary text-secondary-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Comparar Apps</h2>
          <p className="text-xs text-muted-foreground">Análise de desempenho por plataforma</p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
              period === p
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {platformData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma corrida registrada</p>
          <p className="text-xs">Registre corridas para ver a comparação</p>
        </div>
      ) : (
        <>
          {/* Highlight cards */}
          <div className="grid grid-cols-1 gap-2 mb-4">
            {bestApp && (
              <div className="premium-card p-4 animate-fade-in hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground">🏆 Maior faturamento</span>
                    <p className="text-base font-bold text-foreground truncate">{bestApp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(bestApp.ganhos)} em {bestApp.corridas} corridas
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-success shrink-0" />
                </div>
              </div>
            )}

            {bestPerKm && bestPerKm.valorPorKm > 0 && (
              <div className="premium-card p-4 animate-fade-in hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground">🚀 Melhor R$/km</span>
                    <p className="text-base font-bold text-foreground truncate">{bestPerKm.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(bestPerKm.valorPorKm)}/km • {bestPerKm.distancia.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} km
                    </p>
                  </div>
                  <DollarSign className="w-5 h-5 text-warning shrink-0" />
                </div>
              </div>
            )}

            {mostRides && (
              <div className="premium-card p-4 animate-fade-in hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Bike className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground">📦 Mais corridas</span>
                    <p className="text-base font-bold text-foreground truncate">{mostRides.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {mostRides.corridas} corridas • {mostRides.distancia.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} km
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Smart Insights */}
          {insights.length > 0 && (
            <div className="space-y-2 mb-4">
              {insights.map((insight, i) => (
                <div key={i} className="premium-card p-3 flex items-start gap-2.5 animate-fade-in">
                  {insight.icon}
                  <span className="text-xs text-card-foreground leading-relaxed">{insight.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Platform Cards */}
          <div className="space-y-2 mb-5">
            {platformData.map((p, i) => (
              <div key={p.name} className="premium-card p-3 animate-fade-in hover-lift">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getColor(p.name) }} />
                    <span className="text-sm font-semibold text-card-foreground">{p.name}</span>
                    {i === 0 && <Trophy className="w-3.5 h-3.5 text-warning" />}
                  </div>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(p.ganhos)}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 pl-5">
                  <span className="text-[10px] text-muted-foreground">{p.corridas} corridas</span>
                  <span className="text-[10px] text-muted-foreground">{p.distancia.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} km</span>
                  <span className="text-[10px] text-muted-foreground">Média: {formatCurrency(p.mediaCorrida)}</span>
                  <span className="text-[10px] text-muted-foreground">R$/km: {formatCurrency(p.valorPorKm)}</span>
                  <span className="text-[10px] text-muted-foreground">Lucro: {formatCurrency(p.lucro)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="premium-card p-4 mb-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Ganhos por Plataforma</h3>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={platformData} layout="vertical" barSize={18} margin={{ left: 5, right: 50, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} width={75} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} cursor={false} />
                <Bar dataKey="ganhos" radius={[0, 8, 8, 0]} animationDuration={800} name="Ganhos">
                  {platformData.map((p) => (
                    <Cell key={p.name} fill={getColor(p.name)} />
                  ))}
                  <LabelList dataKey="ganhos" position="right" formatter={(v: number) => formatCurrency(v)} style={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="premium-card p-4 mb-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Distribuição de Corridas</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={platformData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="corridas" animationDuration={800} stroke="none">
                  {platformData.map((p) => (
                    <Cell key={p.name} fill={getColor(p.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v + " corridas", name]} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
              {platformData.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getColor(p.name) }} />
                  <span className="text-[10px] text-muted-foreground">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
