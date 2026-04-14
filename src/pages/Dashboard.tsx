import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign, TrendingUp, TrendingDown, MapPin, Bike, Fuel,
  Target, Calendar, Clock, Percent, Zap, Award, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, Legend,
} from "recharts";
import StatCard from "@/components/StatCard";
import SmartInsights from "@/components/SmartInsights";
import { storage, formatCurrency, isToday, isThisWeek, isThisMonth } from "@/lib/storage";
import { stopSound } from "@/lib/sounds";
import { Progress } from "@/components/ui/progress";
import { calculateGamification, getXpProgress, getLevelTitle } from "@/lib/gamification";
import logo from "@/assets/logo.png";

type Period = "hoje" | "semana" | "mes" | "trimestre";

function isLast3Months(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  return d >= threeMonthsAgo;
}

function computeProfit(
  rides: ReturnType<typeof storage.getRides>,
  fuel: ReturnType<typeof storage.getFuel>,
  maintenance: ReturnType<typeof storage.getMaintenance>,
  expenses: ReturnType<typeof storage.getExpenses>,
  filterFn: (d: string) => boolean
) {
  const totalEarnings = rides.filter((r) => filterFn(r.date)).reduce((s, r) => s + r.amount, 0);
  const totalExpenses =
    fuel.filter((f) => filterFn(f.date)).reduce((s, f) => s + f.amount, 0) +
    maintenance.filter((m) => filterFn(m.date)).reduce((s, m) => s + m.amount, 0) +
    expenses.filter((e) => filterFn(e.date)).reduce((s, e) => s + e.amount, 0);
  return totalEarnings - totalExpenses;
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(222, 25%, 12%)",
  border: "1px solid hsl(222, 20%, 25%)",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(210, 20%, 95%)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  padding: "8px 12px",
};

const PIE_COLORS = [
  "hsl(25, 95%, 53%)",   // Combustível - laranja
  "hsl(200, 80%, 50%)",  // Manutenção - azul
  "hsl(340, 75%, 55%)",  // Extras - rosa
];

const PERIOD_LABELS: Record<Period, string> = {
  hoje: "Hoje",
  semana: "Semana",
  mes: "Mês",
  trimestre: "3 Meses",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("hoje");

  useEffect(() => { stopSound(); }, []);

  const profile = storage.getProfile();
  const rides = storage.getRides();
  const fuel = storage.getFuel();
  const maintenance = storage.getMaintenance();
  const expenses = storage.getExpenses();
  const goals = storage.getGoals();

  const filterFn = period === "hoje" ? isToday : period === "semana" ? isThisWeek : period === "trimestre" ? isLast3Months : isThisMonth;

  const data = useMemo(() => {
    const filteredRides = rides.filter((r) => filterFn(r.date));
    const filteredFuel = fuel.filter((f) => filterFn(f.date));
    const filteredMaint = maintenance.filter((m) => filterFn(m.date));
    const filteredExp = expenses.filter((e) => filterFn(e.date));
    const totalEarnings = filteredRides.reduce((s, r) => s + r.amount, 0);
    const totalDistance = filteredRides.reduce((s, r) => s + r.distance, 0);
    const fuelCost = filteredFuel.reduce((s, f) => s + f.amount, 0);
    const maintCost = filteredMaint.reduce((s, m) => s + m.amount, 0);
    const expCost = filteredExp.reduce((s, e) => s + e.amount, 0);
    const totalExpenses = fuelCost + maintCost + expCost;
    const fuelLiters = filteredFuel.reduce((s, f) => s + f.liters, 0);
    return {
      totalEarnings, totalDistance, totalExpenses, fuelCost, maintCost, expCost,
      profit: totalEarnings - totalExpenses,
      rideCount: filteredRides.length,
      avgPerKm: totalDistance > 0 ? totalEarnings / totalDistance : 0,
      avgPerRide: filteredRides.length > 0 ? totalEarnings / filteredRides.length : 0,
      costPerKm: totalDistance > 0 ? totalExpenses / totalDistance : 0,
      profitMargin: totalEarnings > 0 ? ((totalEarnings - totalExpenses) / totalEarnings) * 100 : 0,
      fuelLiters,
      kmPerLiter: fuelLiters > 0 ? totalDistance / fuelLiters : 0,
    };
  }, [rides, fuel, maintenance, expenses, period]);

  const todayProfit = useMemo(() => computeProfit(rides, fuel, maintenance, expenses, isToday), [rides, fuel, maintenance, expenses]);
  const weeklyProfit = useMemo(() => computeProfit(rides, fuel, maintenance, expenses, isThisWeek), [rides, fuel, maintenance, expenses]);
  const monthlyProfit = useMemo(() => computeProfit(rides, fuel, maintenance, expenses, isThisMonth), [rides, fuel, maintenance, expenses]);

  const dailyGoalPct = goals.daily > 0 ? Math.min((todayProfit / goals.daily) * 100, 100) : 0;
  const weeklyGoalPct = goals.weekly > 0 ? Math.min((weeklyProfit / goals.weekly) * 100, 100) : 0;
  const monthlyGoalPct = goals.monthly > 0 ? Math.min((monthlyProfit / goals.monthly) * 100, 100) : 0;

  const gamification = useMemo(() => calculateGamification(), [rides]);
  const xpProgress = useMemo(() => getXpProgress(gamification.xp), [gamification.xp]);

  const earningsByPlatform = useMemo(() => {
    const map: Record<string, { earnings: number; rides: number }> = {};
    const filtered = rides.filter((r) => filterFn(r.date));
    filtered.forEach((r) => {
      const key = r.platform === "Outro" && r.customSource ? r.customSource : (r.platform || "Outro");
      if (!map[key]) map[key] = { earnings: 0, rides: 0 };
      map[key].earnings += r.amount;
      map[key].rides += 1;
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.earnings - a.earnings);
  }, [rides, period]);

  const bestPlatform = earningsByPlatform[0];

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const ganhos = rides.filter(r => new Date(r.date).toDateString() === dateStr).reduce((s, r) => s + r.amount, 0);
      const gastos =
        fuel.filter(f => new Date(f.date).toDateString() === dateStr).reduce((s, f) => s + f.amount, 0) +
        maintenance.filter(m => new Date(m.date).toDateString() === dateStr).reduce((s, m) => s + m.amount, 0) +
        expenses.filter(e => new Date(e.date).toDateString() === dateStr).reduce((s, e) => s + e.amount, 0);
      days.push({ name: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), ganhos, gastos, lucro: ganhos - gastos });
    }
    return days;
  }, [rides, fuel, maintenance, expenses]);

  // Pie chart: always Combustível, Manutenção, Extras with all 3 categories
  const expenseDistribution = useMemo(() => {
    return [
      { name: "Combustível", value: data.fuelCost },
      { name: "Manutenção", value: data.maintCost },
      { name: "Extras", value: data.expCost },
    ].filter(item => item.value > 0);
  }, [data]);

  const greeting = profile.name ? `Olá, ${profile.name}` : "MotoGestor Pro";

  const GoalCard = ({ label, current, goal, pct, icon }: { label: string; current: number; goal: number; pct: number; icon: React.ReactNode }) => (
    <div className="premium-card p-4 hover-lift animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold text-card-foreground">{label}</span>
        </div>
        <span className={`text-xs font-bold ${pct >= 100 ? "text-success" : pct >= 50 ? "text-warning" : "text-muted-foreground"}`}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <Progress value={pct} className="h-2.5 mb-2" />
      <div className="flex justify-between items-center">
        <span className={`text-sm font-bold ${current >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(current)}</span>
        <span className="text-[10px] text-muted-foreground">de {formatCurrency(goal)}</span>
      </div>
    </div>
  );

  const renderPieLabel = ({ cx, cy, midAngle, outerRadius, name }: { cx: number; cy: number; midAngle: number; outerRadius: number; name: string; percent: number }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 18;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="hsl(215, 15%, 55%)" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={11}>
        {name}
      </text>
    );
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
          <img src={logo} alt="MotoGestor Pro" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{greeting}</h1>
          <p className="text-xs text-muted-foreground">Seu painel financeiro inteligente</p>
        </div>
        {/* MTG mini badge */}
        <div
          onClick={() => navigate("/conquistas")}
          className="premium-card px-3 py-1.5 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all duration-200 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-warning" />
          <span className="text-[10px] font-bold text-card-foreground">Nv.{gamification.level}</span>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 mb-5">
        {(["hoje", "semana", "mes", "trimestre"] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${period === p ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <SmartInsights />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="Ganhos" value={formatCurrency(data.totalEarnings)} icon={DollarSign} gradient="success" />
        <StatCard label="Gastos" value={formatCurrency(data.totalExpenses)} icon={TrendingDown} gradient="danger" />
        <StatCard label="Lucro Líquido" value={formatCurrency(data.profit)} icon={TrendingUp} gradient={data.profit >= 0 ? "success" : "danger"} negative={data.profit < 0} />
        <StatCard label="Distância" value={`${data.totalDistance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km`} icon={MapPin} gradient="accent" />
        <StatCard label="Corridas" value={data.rideCount.toString()} icon={Bike} gradient="accent" />
        <StatCard label="R$/km" value={formatCurrency(data.avgPerKm)} icon={Fuel} gradient={data.avgPerKm < 0 ? "danger" : "success"} negative={data.avgPerKm < 0} />
        <StatCard label="Média/Corrida" value={formatCurrency(data.avgPerRide)} icon={Clock} gradient="success" />
        <StatCard label="Margem" value={`${data.profitMargin.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} icon={Percent} gradient={data.profitMargin >= 0 ? "success" : "danger"} negative={data.profitMargin < 0} />
      </div>

      {/* Platform Earnings */}
      {earningsByPlatform.length > 0 && (
        <div className="premium-card p-4 mb-5 animate-fade-in hover-lift">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Ganhos por App
            </h3>
            <button onClick={() => navigate("/comparar-apps")} className="text-[10px] text-primary font-semibold">
              Ver detalhes →
            </button>
          </div>
          {bestPlatform && (
            <p className="text-xs text-muted-foreground mb-3">
              🚀 Você ganhou mais com <strong className="text-foreground">{bestPlatform.name}</strong> — {formatCurrency(bestPlatform.earnings)}
            </p>
          )}
          <div className="space-y-2">
            {earningsByPlatform.slice(0, 4).map((p) => {
              const maxEarnings = earningsByPlatform[0]?.earnings || 1;
              const pct = (p.earnings / maxEarnings) * 100;
              return (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-card-foreground w-16 truncate">{p.name}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-card-foreground w-16 text-right">{formatCurrency(p.earnings)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}


      <div className="premium-card p-4 mb-5 animate-fade-in hover-lift">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-card-foreground">{getLevelTitle(gamification.level)}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{gamification.xp} MTG</span>
        </div>
        <Progress value={xpProgress.pct} className="h-2 mb-1.5" />
        <div className="flex justify-between">
          <span className="text-[10px] text-muted-foreground">{xpProgress.current}/{xpProgress.needed} MTG</span>
          <span className="text-[10px] text-muted-foreground">🔥 {gamification.streakDays} dias seguidos</span>
        </div>
      </div>

      {/* Goals */}
      {(goals.daily > 0 || goals.weekly > 0 || goals.monthly > 0) && (
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metas de Lucro Líquido</h3>
          {goals.daily > 0 && <GoalCard label="Meta Diária" current={todayProfit} goal={goals.daily} pct={dailyGoalPct} icon={<Target className="w-4 h-4 text-primary" />} />}
          {goals.weekly > 0 && <GoalCard label="Meta Semanal" current={weeklyProfit} goal={goals.weekly} pct={weeklyGoalPct} icon={<Calendar className="w-4 h-4 text-accent" />} />}
          {goals.monthly > 0 && <GoalCard label="Meta Mensal" current={monthlyProfit} goal={goals.monthly} pct={monthlyGoalPct} icon={<TrendingUp className="w-4 h-4 text-success" />} />}
        </div>
      )}

      {!goals.daily && !goals.weekly && !goals.monthly && (
        <div className="text-center text-xs text-muted-foreground mb-5 premium-card p-4">
          <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          Defina suas metas no perfil para acompanhar seu progresso
        </div>
      )}

      {/* Bar Chart */}
      {last7Days.some((d) => d.ganhos > 0 || d.gastos > 0) && (
        <div className="premium-card p-4 mb-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Últimos 7 dias</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7Days} barGap={2}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} itemStyle={{ color: "hsl(210, 20%, 95%)" }} labelStyle={{ color: "hsl(210, 20%, 80%)" }} cursor={false} />
              <Bar dataKey="ganhos" fill="hsl(152, 60%, 45%)" radius={[6, 6, 0, 0]} animationDuration={800} name="Ganhos" />
              <Bar dataKey="gastos" fill="hsl(0, 62%, 50%)" radius={[6, 6, 0, 0]} animationDuration={800} name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Area Chart */}
      {last7Days.some((d) => d.lucro !== 0) && (
        <div className="premium-card p-4 mb-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Evolução do Lucro</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="lucroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} itemStyle={{ color: "hsl(210, 20%, 95%)" }} labelStyle={{ color: "hsl(210, 20%, 80%)" }} cursor={false} />
              <Area type="monotone" dataKey="lucro" stroke="hsl(152, 60%, 45%)" strokeWidth={2.5} fill="url(#lucroGradient)" animationDuration={800} dot={{ r: 3, fill: "hsl(152, 60%, 45%)", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie Chart - Distribuição de Gastos */}
      {expenseDistribution.length > 0 ? (
        <div className="premium-card p-4 mb-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Distribuição de Gastos</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <defs>
                {PIE_COLORS.map((color, i) => (
                  <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={expenseDistribution}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                animationDuration={800}
                stroke="none"
                label={renderPieLabel}
                labelLine={false}
              >
                {expenseDistribution.map((entry, i) => {
                  const colorIndex = entry.name === "Combustível" ? 0 : entry.name === "Manutenção" ? 1 : 2;
                  return <Cell key={i} fill={`url(#pieGrad${colorIndex})`} />;
                })}
              </Pie>
              <Tooltip
                formatter={(v: number, name: string) => [formatCurrency(v), name]}
                contentStyle={tooltipStyle}
                itemStyle={{ color: "hsl(210, 20%, 95%)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {[
              { name: "Combustível", color: PIE_COLORS[0], value: data.fuelCost },
              { name: "Manutenção", color: PIE_COLORS[1], value: data.maintCost },
              { name: "Extras", color: PIE_COLORS[2], value: data.expCost },
            ].map((item) => (
              <div key={item.name} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-[10px] font-semibold text-card-foreground">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="premium-card p-4 mb-4 animate-fade-in text-center">
          <h3 className="text-sm font-semibold text-card-foreground mb-2">Distribuição de Gastos</h3>
          <p className="text-xs text-muted-foreground">Registre gastos de combustível, manutenção ou extras para ver o gráfico</p>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center mt-4 mb-2">
        Informações apenas educativas, não constituem aconselhamento financeiro.
      </p>
    </div>
  );
}
