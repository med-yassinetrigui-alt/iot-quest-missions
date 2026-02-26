import { useState, useCallback } from "react";
import { GameState } from "@/types/game";

const initialState: GameState = {
  totalXP: 0,
  level: 1,
  completedMissions: [],
  earnedBadges: [],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const addXP = useCallback((xp: number) => {
    setState((prev) => {
      const newXP = prev.totalXP + xp;
      const newLevel = Math.floor(newXP / 300) + 1;
      return { ...prev, totalXP: newXP, level: newLevel };
    });
  }, []);

  const completeMission = useCallback((missionId: string, xp: number) => {
    setState((prev) => {
      if (prev.completedMissions.includes(missionId)) return prev;
      const newXP = prev.totalXP + xp;
      const newLevel = Math.floor(newXP / 300) + 1;
      return {
        ...prev,
        totalXP: newXP,
        level: newLevel,
        completedMissions: [...prev.completedMissions, missionId],
      };
    });
  }, []);

  const earnBadge = useCallback((badgeId: string) => {
    setState((prev) => {
      if (prev.earnedBadges.includes(badgeId)) return prev;
      return { ...prev, earnedBadges: [...prev.earnedBadges, badgeId] };
    });
  }, []);

  return { state, addXP, completeMission, earnBadge };
}
