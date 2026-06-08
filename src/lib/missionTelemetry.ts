import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { Mission } from "@/types/game";

/**
 * When a mission is completed, record a synthetic burst of sensor readings to
 * the Cloud database so the dashboard can chart the "live" data the student
 * just produced in the lab.
 */
export async function logMissionReadings(mission: Mission) {
  const sessionId = getSessionId();
  const sensors = mission.requiredSensors.length > 0
    ? mission.requiredSensors
    : ["Generic Sensor"];

  const now = Date.now();
  const rows: {
    session_id: string;
    mission_id: string;
    sensor: string;
    value: number;
    recorded_at: string;
  }[] = [];

  // 12 samples per sensor, one every ~5 seconds in the past
  for (const sensor of sensors) {
    const base = 200 + Math.random() * 400;
    for (let i = 0; i < 12; i++) {
      const noise = (Math.random() - 0.5) * 120;
      const drift = Math.sin(i / 2) * 80;
      rows.push({
        session_id: sessionId,
        mission_id: mission.id,
        sensor,
        value: Math.max(0, Math.round(base + drift + noise)),
        recorded_at: new Date(now - (12 - i) * 5000).toISOString(),
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
