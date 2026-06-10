import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { useGameState } from "@/hooks/useGameState";
import { missions, badges } from "@/data/gameData";
import { labDashboards } from "@/data/labDashboards";
import LabDashboardCard, { Reading } from "@/components/dashboard/LabDashboardCard";


export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useGameState();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);


  // Load + live-refresh readings
  useEffect(() => {
    const sessionId = getSessionId();
    const load = async () => {
      const { data } = await supabase
        .from("sensor_readings")
        .select("id, mission_id, sensor, value, recorded_at")
        .eq("session_id", sessionId)
        .order("recorded_at", { ascending: true })
        .limit(2000);
      setReadings((data ?? []) as Reading[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("dashboard-readings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setReadings((prev) => [...prev, payload.new as Reading]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const byMission = useMemo(() => {
    const map: Record<string, Reading[]> = {};
    for (const r of readings) {
      (map[r.mission_id] ??= []).push(r);
    }
    return map;
  }, [readings]);

  const alerts = useMemo(() => {
    return missions.map((m) => {
      const solved = state.completedMissions.includes(m.id);
      return {
        id: m.id,
        title: m.title,
        icon: m.icon,
        severity: solved ? "ok" : m.difficulty === "hard" ? "critical" : "warning",
        solved,
      };
    });
  }, [state.completedMissions]);

  const activeAlerts = alerts.filter((a) => !a.solved).length;
  const resolved = alerts.filter((a) => a.solved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4 md:p-8 pt-14">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6 flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground">
            🛰️ Smart City Control Center
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            One live dashboard per lab — track sensors, actuators and alerts in real time.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-card border-2 border-border hover:border-primary/40 rounded-xl px-3 py-2 text-sm font-display font-bold text-foreground shadow transition-colors shrink-0"
        >
          <Map className="h-4 w-4" />
          City Map
        </button>
      </motion.header>


      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label="Level" value={state.level} icon="🚀" tone="primary" />
        <StatCard label="Total XP" value={state.totalXP} icon="⭐" tone="accent" />
        <StatCard
          label="Labs online"
          value={`${resolved}/${missions.length}`}
          icon="✅"
          tone="secondary"
        />
        <StatCard
          label="Active alerts"
          value={activeAlerts}
          icon="🚨"
          tone={activeAlerts > 0 ? "destructive" : "secondary"}
        />
      </div>

      {/* Per-lab dashboards */}
      <section className="mb-6">
        <h2 className="font-display text-2xl font-extrabold text-foreground mb-3">
          🧪 Lab dashboards
        </h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading live data…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {labDashboards.map((dash) => (
              <LabDashboardCard
                key={dash.missionId}
                dash={dash}
                readings={byMission[dash.missionId] ?? []}
                solved={state.completedMissions.includes(dash.missionId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Alerts + Badges row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-2xl p-4 md:p-6 shadow-lg border border-border"
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-3">
            🚨 City problems
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[26rem] overflow-y-auto pr-1">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-xl border-2"
                style={{
                  borderColor:
                    a.severity === "ok"
                      ? "hsl(var(--secondary))"
                      : a.severity === "critical"
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--game-yellow))",
                  background:
                    a.severity === "ok"
                      ? "hsl(var(--secondary) / 0.1)"
                      : a.severity === "critical"
                      ? "hsl(var(--destructive) / 0.1)"
                      : "hsl(var(--game-yellow) / 0.1)",
                }}
              >
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground text-sm truncate">
                    {a.title}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{
                    background:
                      a.severity === "ok"
                        ? "hsl(var(--secondary))"
                        : a.severity === "critical"
                        ? "hsl(var(--destructive))"
                        : "hsl(var(--game-yellow))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  {a.severity === "ok"
                    ? "✅ Solved"
                    : a.severity === "critical"
                    ? "🔴 Critical"
                    : "🟡 Open"}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border border-border"
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-3">
            🏆 Badges ({state.earnedBadges.length}/{badges.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => {
              const earned = state.earnedBadges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${
                    earned
                      ? "border-accent bg-accent/10"
                      : "border-border bg-muted/40 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <p className="font-display font-bold text-sm">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: string;
  tone: "primary" | "accent" | "secondary" | "destructive";
}) {
  const toneClass = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    accent: "from-accent/20 to-accent/5 border-accent/30",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/30",
    destructive: "from-destructive/20 to-destructive/5 border-destructive/40",
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-gradient-to-br ${toneClass} border-2 rounded-2xl p-3 md:p-4 shadow`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
          {value}
        </span>
      </div>
      <p className="text-xs md:text-sm font-body text-muted-foreground mt-1">
        {label}
      </p>
    </motion.div>
  );
}
