import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { storage, formatCurrency } from "@/lib/storage";
import { getEvolution, getDailyTimeline, type Comparison } from "@/lib/evolution";

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(222, 25%, 12%)",
  border: "1px solid hsl(222, 20%, 25%)",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(210, 20%, 95%)",
  padding: "8px 12px",
};

function VariationBadge({ value, invert = false }: { value: number; invert?: boolean }) {
  const isPositive = invert ? value < 0 : value > 0;
  const isNeutral = Math.abs(value) < 0.01;
  const Icon = isNeutral ? Minus : value > 0 ? TrendingUp : TrendingDown;
  const colorClass = isNeutral
    ? "text-muted-foreground bg-muted/40"
    : isPositive
    ? "text-success bg-success/10"
    : "text-destructive bg-destructive/10";
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function ComparisonRow({
  title,
  icon,
  data,
  prevLabel,
}: {
  title: string;
  icon: React.ReactNode;
  data: Comparison;
  prevLabel: string;
}) {
  return (
    <div className="bg-secondary/40 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold text-card-foreground">{title}</span>
        </div>
        <VariationBadge value={data.variation.profit} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Ganhos</p>
          <p className="text-xs font-bold text-success">{formatCurrency(data.current.earnings)}</p>
          <p className="text-[9px] text-muted-foreground">vs {formatCurrency(data.previous.earnings)}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Gastos</p>
          <p className="text-xs font-bold text-destructive">{formatCurrency(data.current.expenses)}</p>
          <p className="text-[9px] text-muted-foreground">vs {formatCurrency(data.previous.expenses)}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Lucro</p>
          <p className={`text-xs font-bold ${data.current.profit >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCurrency(data.current.profit)}
          </p>
          <p className="text-[9px] text-muted-foreground">vs {formatCurrency(data.previous.profit)}</p>
        </div>
      </div>
      <p className="text-[9px] text-muted-foreground text-center">comparado a {prevLabel}</p>
    </div>
  );
}

export default function EvolutionPanel() {
  const { day, week, month, timeline } = useMemo(() => {
    const rides = storage.getRides();
    const fuel = storage.getFuel();
    const maint = storage.getMaintenance();
    const exp = storage.getExpenses();
    const ev = getEvolution(rides, fuel, maint, exp);
    return { ...ev, timeline: getDailyTimeline(rides, fuel, maint, exp, 30) };
  }, []);

  return (
    <div className="premium-card p-4 mb-5 animate-fade-in hover-lift">
      <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Evolução Temporal
      </h3>

      <div className="space-y-2 mb-4">
        <ComparisonRow title="Hoje" icon={<Calendar className="w-3.5 h-3.5 text-primary" />} data={day} prevLabel="ontem" />
        <ComparisonRow title="Esta Semana" icon={<CalendarDays className="w-3.5 h-3.5 text-primary" />} data={week} prevLabel="semana anterior" />
        <ComparisonRow title="Este Mês" icon={<CalendarRange className="w-3.5 h-3.5 text-primary" />} data={month} prevLabel="mês anterior" />
      </div>

      <div className="border-t border-border/40 pt-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Últimos 30 dias</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 25%)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(215, 15%, 55%)" }} interval={4} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(215, 15%, 55%)" }} width={40} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            <Area type="monotone" dataKey="ganhos" stroke="hsl(142, 70%, 45%)" fill="url(#gainGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="gastos" stroke="hsl(0, 70%, 55%)" fill="url(#lossGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
