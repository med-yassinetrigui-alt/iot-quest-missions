import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { LabDashboard, MetricDef } from "@/data/labDashboards";

export type Reading = {
  id: string;
  mission_id: string;
  sensor: string;
  value: number;
  recorded_at: string;
};

interface Props {
  dash: LabDashboard;
  readings: Reading[];
  solved: boolean;
}

export default function LabDashboardCard({ dash, readings, solved }: Props) {
  // Build chart series keyed by time
  const chartData = useMemo(() => {
    const sorted = [...readings].sort(
      (a, b) => +new Date(a.recorded_at) - +new Date(b.recorded_at)
    );
    const rows: Record<string, { time: string; t: number } & Record<string, number>> = {};
    sorted.forEach((r) => {
      const t = +new Date(r.recorded_at);
      const key = new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      if (!rows[key]) rows[key] = { time: key, t } as any;
      (rows[key] as any)[r.sensor] = Number(r.value);
    });
    return Object.values(rows).sort((a, b) => a.t - b.t).slice(-30);
  }, [readings]);

  // Latest value per metric
  const latest = useMemo(() => {
    const map: Record<string, number | undefined> = {};
    const sorted = [...readings].sort(
      (a, b) => +new Date(b.recorded_at) - +new Date(a.recorded_at)
    );
    for (const m of dash.metrics) {
      const found = sorted.find((r) => r.sensor === m.key);
      map[m.key] = found ? Number(found.value) : undefined;
    }
    return map;
  }, [readings, dash.metrics]);

  const lineMetrics = dash.metrics.filter((m) => m.kind === "line");
  const countMetrics = dash.metrics.filter((m) => m.kind === "count");
  const stateMetrics = dash.metrics.filter((m) => m.kind === "state");

  const hasData = readings.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 md:p-5 shadow-lg border-2 border-border hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-3xl">{dash.emoji}</span>
          <div className="min-w-0">
            <h3 className="font-display font-extrabold text-foreground text-base md:text-lg truncate">
              {dash.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {dash.description}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
            solved
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {solved ? "✅ Active" : "⏳ Offline"}
        </span>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {dash.metrics.slice(0, 3).map((m) => (
          <MetricTile key={m.key} m={m} value={latest[m.key]} hasData={hasData} />
        ))}
      </div>

      {/* Main chart */}
      {!hasData ? (
        <div className="h-32 flex items-center justify-center text-center text-xs text-muted-foreground bg-muted/30 rounded-xl">
          📡 Complete the lab to stream live data
        </div>
      ) : lineMetrics.length > 0 ? (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9 }} width={32} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 10,
                  fontSize: 11,
                }}
              />
              {lineMetrics.map((m) => (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.slice(-10)} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="time" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} width={32} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 10,
                  fontSize: 11,
                }}
              />
              {countMetrics.map((m) => (
                <Bar key={m.key} dataKey={m.key} fill={m.color} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* State row */}
      {stateMetrics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {stateMetrics.map((m) => {
            const on = (latest[m.key] ?? 0) > 0;
            return (
              <div
                key={m.key}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2"
                style={{
                  borderColor: on ? m.color : "hsl(var(--border))",
                  background: on ? `${m.color.replace(")", " / 0.15)").replace("hsl(", "hsl(")}` : "hsl(var(--muted) / 0.4)",
                }}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${on ? "animate-pulse" : ""}`}
                  style={{ background: on ? m.color : "hsl(var(--muted-foreground))" }}
                />
                <span className="text-xs font-display font-bold">
                  {m.label}: {on ? "ON" : "OFF"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function MetricTile({
  m,
  value,
  hasData,
}: {
  m: MetricDef;
  value: number | undefined;
  hasData: boolean;
}) {
  const display = !hasData || value === undefined
    ? "—"
    : m.kind === "state"
    ? value > 0
      ? "ON"
      : "OFF"
    : Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);

  return (
    <div
      className="rounded-xl p-2 border"
      style={{
        borderColor: `${m.color.replace(")", " / 0.35)")}`,
        background: `${m.color.replace(")", " / 0.08)")}`,
      }}
    >
      <p className="text-[10px] font-body text-muted-foreground truncate">
        {m.label}
      </p>
      <p
        className="font-display text-lg font-extrabold leading-tight"
        style={{ color: m.color }}
      >
        {display}
        {m.unit && hasData && value !== undefined && m.kind !== "state" && (
          <span className="text-[10px] font-body text-muted-foreground ml-1">
            {m.unit}
          </span>
        )}
      </p>
    </div>
  );
}
