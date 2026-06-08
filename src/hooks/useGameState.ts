import { useState, useCallback, useEffect } from "react";
import { GameState } from "@/types/game";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { missions } from "@/data/gameData";
import { logMissionCompletion } from "@/lib/missionTelemetry";

const initialState: GameState = {
  totalXP: 0,
  level: 1,
  completedMissions: [],
  earnedBadges: [],
};

const BADGES_KEY = "iot-quest-badges";

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  // Load completions from Cloud on mount
  useEffect(() => {
    const sessionId = getSessionId();
    (async () => {
      const { data, error } = await supabase
        .from("mission_completions")
        .select("mission_id, xp")
        .eq("session_id", sessionId);
      if (error) {
        console.error(error);
        return;
      }
      const completed = (data ?? []).map((r) => r.mission_id);
      const totalXP = (data ?? []).reduce((sum, r) => sum + (r.xp ?? 0), 0);
      const badges = JSON.parse(localStorage.getItem(BADGES_KEY) ?? "[]");
      setState({
        totalXP,
        level: Math.floor(totalXP / 300) + 1,
        completedMissions: completed,
        earnedBadges: badges,
      });
    })();
  }, []);

  const addXP = useCallback((xp: number) => {
    setState((prev) => {
      const newXP = prev.totalXP + xp;
      return { ...prev, totalXP: newXP, level: Math.floor(newXP / 300) + 1 };
    });
  }, []);

  const completeMission = useCallback((missionId: string, xp: number) => {
    setState((prev) => {
      if (prev.completedMissions.includes(missionId)) return prev;
      const newXP = prev.totalXP + xp;
      return {
        ...prev,
        totalXP: newXP,
        level: Math.floor(newXP / 300) + 1,
        completedMissions: [...prev.completedMissions, missionId],
      };
    });
    // Fire-and-forget: persist completion + log readings for the dashboard
    void logMissionCompletion(missionId, xp);
    const mission = missions.find((m) => m.id === missionId);
    if (mission) {
      import("@/lib/missionTelemetry").then(({ logMissionReadings }) =>
        logMissionReadings(mission)
      );
    }
  }, []);

  const earnBadge = useCallback((badgeId: string) => {
    setState((prev) => {
      if (prev.earnedBadges.includes(badgeId)) return prev;
      const next = [...prev.earnedBadges, badgeId];
      localStorage.setItem(BADGES_KEY, JSON.stringify(next));
      return { ...prev, earnedBadges: next };
    });
  }, []);

  return { state, addXP, completeMission, earnBadge };
}
