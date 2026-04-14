import { useMemo, useState } from "react";
import { Download, BarChart3, Share2, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { storage, formatCurrency, isToday, isThisWeek, isThisMonth } from "@/lib/storage";
import { toast } from "sonner";

type Period = "hoje" | "semana" | "mes";

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(222, 25%, 12%)",
  border: "1px solid hsl(222, 20%, 25%)",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(210, 20%, 95%)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  padding: "8px 12px",
};

const PIE_COLORS = ["hsl(25, 95%, 53%)", "hsl(200, 80%, 50%)", "hsl(340, 75%, 55%)"];

const PERIOD_LABELS: Record<Period, string> = { hoje: "Hoje", semana: "Semana", mes: "Mês" };

export default function Reports() {
  const [period, setPeriod] = useState<Period>("mes");
  const rides = storage.getRides();
  const fuel = storage.getFuel();
  const maint = storage.getMaintenance();
  const exp = storage.getExpenses();

  const filterFn = period === "hoje" ? isToday : period === "semana" ? isThisWeek : isThisMonth;

  const data = useMemo(() => {
    const fr = rides.filter(r => filterFn(r.date));
    const ff = fuel.filter(f => filterFn(f.date));
    const fm = maint.filter(m => filterFn(m.date));
    const fe = exp.filter(e => filterFn(e.date));
    const earnings = fr.reduce((s, r) => s + r.amount, 0);
    const distance = fr.reduce((s, r) => s + r.distance, 0);
    const fuelCost = ff.reduce((s, f) => s + f.amount, 0);
    const maintCost = fm.reduce((s, m) => s + m.amount, 0);
    const expCost = fe.reduce((s, e) => s + e.amount, 0);
    const totalExpenses = fuelCost + maintCost + expCost;
    const fuelLiters = ff.reduce((s, f) => s + f.liters, 0);

    // Platform breakdown
    const platformMap: Record<string, number> = {};
    fr.forEach(r => { platformMap[r.platform] = (platformMap[r.platform] || 0) + r.amount; });

    // Best day
    const dayMap: Record<string, number> = {};
    fr.forEach(r => {
      const day = new Date(r.date).toLocaleDateString("pt-BR", { weekday: "long" });
      dayMap[day] = (dayMap[day] || 0) + r.amount;
    });
    const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

    return {
      earnings, totalExpenses, profit: earnings - totalExpenses,
      rideCount: fr.length, distance, fuelCost, maintCost, expCost,
      costPerKm: distance > 0 ? totalExpenses / distance : 0,
      avgPerRide: fr.length > 0 ? earnings / fr.length : 0,
      avgPerKm: distance > 0 ? earnings / distance : 0,
      profitMargin: earnings > 0 ? ((earnings - totalExpenses) / earnings) * 100 : 0,
      fuelLiters,
      kmPerLiter: fuelLiters > 0 ? distance / fuelLiters : 0,
      platformData: Object.entries(platformMap).map(([name, value]) => ({ name, value })),
      bestDay: bestDay ? bestDay[0] : "—",
      bestDayAmount: bestDay ? bestDay[1] : 0,
    };
  }, [rides, fuel, maint, exp, period]);

  const expenseDistribution = useMemo(() => [
    { name: "Combustível", value: data.fuelCost },
    { name: "Manutenção", value: data.maintCost },
    { name: "Extras", value: data.expCost },
  ].filter(item => item.value > 0), [data]);

  // Last 7 days for area chart
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const ganhos = rides.filter(r => new Date(r.date).toDateString() === dateStr).reduce((s, r) => s + r.amount, 0);
      const gastos =
        fuel.filter(f => new Date(f.date).toDateString() === dateStr).reduce((s, f) => s + f.amount, 0) +
        maint.filter(m => new Date(m.date).toDateString() === dateStr).reduce((s, m) => s + m.amount, 0) +
        exp.filter(e => new Date(e.date).toDateString() === dateStr).reduce((s, e) => s + e.amount, 0);
      days.push({ name: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), ganhos, gastos, lucro: ganhos - gastos });
    }
    return days;
  }, [rides, fuel, maint, exp]);

  const exportCSV = () => {
    const headers = "Data,Tipo,Valor,Distância,Plataforma\n";
    const rows = rides.map(r => `${new Date(r.date).toLocaleDateString("pt-BR")},${r.type},${r.amount},${r.distance},${r.platform}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "motogestor_relatorio.csv"; a.click();
    toast.success("Relatório exportado!");
  };

  const shareWhatsApp = () => {
    const text = `📊 *Relatório MotoGestor Pro - ${PERIOD_LABELS[period]}*\n\n💰 Ganhos: ${formatCurrency(data.earnings)}\n💸 Gastos: ${formatCurrency(data.totalExpenses)}\n📈 Lucro: ${formatCurrency(data.profit)}\n🏍️ Corridas: ${data.rideCount}\n📍 Distância: ${data.distance.toFixed(1)} km\n💵 Média/Corrida: ${formatCurrency(data.avgPerRide)}\n⛽ Combustível: ${formatCurrency(data.fuelCost)}\n🔧 Manutenção: ${formatCurrency(data.maintCost)}\n\n_Enviado pelo MotoGestor Pro_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const stats = [
    { label: "Total Ganho", value: formatCurrency(data.earnings), color: "text-success" },
    { label: "Total Gasto", value: formatCurrency(data.totalExpenses), color: "text-destructive" },
    { label: "Lucro Líquido", value: formatCurrency(data.profit), color: data.profit >= 0 ? "text-success" : "text-destructive" },
    { label: "Corridas", value: data.rideCount.toString(), color: "" },
    { label: "Distância Total", value: `${data.distance.toFixed(1)} km`, color: "" },
    { label: "Custo/km", value: formatCurrency(data.costPerKm), color: "" },
    { label: "Média/Corrida", value: formatCurrency(data.avgPerRide), color: "" },
    { label: "Média/km", value: formatCurrency(data.avgPerKm), color: "" },
    { label: "Margem de Lucro", value: `${data.profitMargin.toFixed(1)}%`, color: data.profitMargin >= 0 ? "text-success" : "text-destructive" },
    { label: "Melhor Dia", value: data.bestDay, color: "text-primary" },
    { label: "Combustível", value: formatCurrency(data.fuelCost), color: "text-warning" },
    { label: "Manutenção", value: formatCurrency(data.maintCost), color: "text-accent" },
  ];

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Relatórios</h2>
        <div className="flex gap-2">
          <button onClick={shareWhatsApp} className="flex items-center gap-1.5 px-3 py-2 bg-success text-success-foreground rounded-xl text-xs font-semibold shadow-sm hover-lift">
            <Share2 className="w-3.5 h-3.5" />WhatsApp
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold shadow-sm hover-lift">
            <Download className="w-3.5 h-3.5" />CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(["hoje", "semana", "mes"] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${period === p ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-secondary text-secondary-foreground"}`}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {stats.map(s => (
          <div key={s.label} className="premium-card p-3 animate-fade-in hover-lift">
            <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-sm font-bold ${s.color || "text-card-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="premium-card p-4 mb-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Ganhos vs Gastos</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[{ name: "Resultado", ganhos: data.earnings, gastos: data.totalExpenses }]}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} itemStyle={{ color: "hsl(210, 20%, 95%)" }} labelStyle={{ color: "hsl(210, 20%, 80%)" }} cursor={false} />
            <Bar dataKey="ganhos" fill="hsl(152, 60%, 45%)" radius={[6, 6, 0, 0]} animationDuration={800} name="Ganhos" />
            <Bar dataKey="gastos" fill="hsl(0, 62%, 50%)" radius={[6, 6, 0, 0]} animationDuration={800} name="Gastos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Area Chart - Lucro 7 dias */}
      {last7Days.some(d => d.lucro !== 0) && (
        <div className="premium-card p-4 mb-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Evolução do Lucro (7 dias)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="reportLucroGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} itemStyle={{ color: "hsl(210, 20%, 95%)" }} labelStyle={{ color: "hsl(210, 20%, 80%)" }} cursor={false} />
              <Area type="monotone" dataKey="lucro" stroke="hsl(152, 60%, 45%)" strokeWidth={2.5} fill="url(#reportLucroGrad)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie Chart - Distribuição de Gastos */}
      {expenseDistribution.length > 0 && (
        <div className="premium-card p-4 mb-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Distribuição de Gastos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expenseDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={800} stroke="none">
                {expenseDistribution.map((entry, i) => {
                  const idx = entry.name === "Combustível" ? 0 : entry.name === "Manutenção" ? 1 : 2;
                  return <Cell key={i} fill={PIE_COLORS[idx]} />;
                })}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name]} contentStyle={tooltipStyle} itemStyle={{ color: "hsl(210, 20%, 95%)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {expenseDistribution.map((item, i) => {
              const idx = item.name === "Combustível" ? 0 : item.name === "Manutenção" ? 1 : 2;
              return (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform Breakdown */}
      {data.platformData.length > 0 && (
        <div className="premium-card p-4 mb-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Ganhos por Plataforma</h3>
          <div className="space-y-2">
            {data.platformData.sort((a, b) => b.value - a.value).map(p => {
              const pct = data.earnings > 0 ? (p.value / data.earnings) * 100 : 0;
              return (
                <div key={p.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-card-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(p.value)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rides.length === 0 && (
        <div className="text-center py-8 text-muted-foreground premium-card p-6">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Adicione corridas para ver relatórios</p>
        </div>
      )}
    </div>
  );
}
