import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { Mission } from "@/types/game";
import { dashboardForMission, MetricDef } from "@/data/labDashboards";

/**
 * When a mission is completed, record a synthetic burst of sensor readings to
 * the Cloud database so the dashboard can chart the "live" data the student
 * just produced in the lab. Metrics are mission-specific (see labDashboards).
 */
export async function logMissionReadings(mission: Mission) {
  const sessionId = getSessionId();
  const dash = dashboardForMission(mission.id);

  // Fallback: generic single metric
  const metrics: MetricDef[] = dash?.metrics ?? [
    { key: mission.requiredSensors[0] ?? "Generic Sensor", label: "Value", kind: "line", color: "hsl(var(--primary))", base: 300, amplitude: 200, noise: 40 },
  ];

  const SAMPLES = 16;
  const STEP_MS = 4000;
  const now = Date.now();
  const rows: {
    session_id: string;
    mission_id: string;
    sensor: string;
    value: number;
    recorded_at: string;
  }[] = [];

  // First generate driver metrics in a map so state metrics can read them.
  const generated: Record<string, number[]> = {};

  for (const m of metrics) {
    if (m.drivenBy) continue;
    const series: number[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const wave = Math.sin((i / SAMPLES) * Math.PI * 2) * m.amplitude;
      const noise = (Math.random() - 0.5) * 2 * m.noise;
      let v = m.base + wave + noise;
      if (m.min !== undefined) v = Math.max(m.min, v);
      if (m.max !== undefined) v = Math.min(m.max, v);
      series.push(+v.toFixed(2));
    }
    generated[m.key] = series;
  }

  for (const m of metrics) {
    if (!m.drivenBy) continue;
    const driver = generated[m.drivenBy] ?? [];
    const series: number[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const d = driver[i] ?? 0;
      const isOn = m.driverInvert
        ? d < (m.driverThreshold ?? 0)
        : d > (m.driverThreshold ?? 0);
      if (m.kind === "state") {
        series.push(isOn ? 1 : 0);
      } else {
        // e.g. lamp voltage: 0 when off, ~9V when on
        const onValue = (m.max ?? 9) * 0.78;
        const v = isOn ? onValue + (Math.random() - 0.5) * 2 * m.noise : 0;
        series.push(+v.toFixed(2));
      }
    }
    generated[m.key] = series;
  }

  for (const m of metrics) {
    const series = generated[m.key] ?? [];
    for (let i = 0; i < series.length; i++) {
      rows.push({
        session_id: sessionId,
        mission_id: mission.id,
        sensor: m.key,
        value: series[i],
        recorded_at: new Date(now - (SAMPLES - i) * STEP_MS).toISOString(),
      });
    }
  }

  const { error } = await supabase.from("sensor_readings").insert(rows);
  if (error) console.error("logMissionReadings", error);
}

export async function logMissionCompletion(missionId: string, xp: number) {
  const sessionId = getSessionId();
  const { error } = await supabase
    .from("mission_completions")
    .upsert(
      { session_id: sessionId, mission_id: missionId, xp },
      { onConflict: "session_id,mission_id" }
    );
  if (error) console.error("logMissionCompletion", error);
}
