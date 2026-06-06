export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  xp: number;
  location: { x: number; y: number };
  icon: string;
  unlocked: boolean;
  completed: boolean;
  hints: string[];
  requiredSensors: string[];
  requiredActuators: string[];
  guide?: {
    wiring: string;
    code: string;
    why: string;
  };
}

export interface IoTBlock {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

export interface PlacedBlock {
  block: IoTBlock;
  zone: "sensor" | "controller" | "actuator";
}

export interface GameState {
  totalXP: number;
  level: number;
  completedMissions: string[];
  earnedBadges: string[];
}
