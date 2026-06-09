// Per-lab dashboard configuration.
// Defines what metrics each mission produces, how to simulate them
// and how the dashboard should visualize them.

export type MetricKind = "line" | "gauge" | "state" | "count";

export interface MetricDef {
  key: string;            // sensor name stored in DB
  label: string;
  unit?: string;
  kind: MetricKind;       // visual hint
  color: string;          // HSL color from design tokens
  min?: number;
  max?: number;
  // synthetic generator
  base: number;
  amplitude: number;
  noise: number;
  // for state metrics, threshold to flip on/off relative to driver metric
  drivenBy?: string;      // key of driver metric
  driverThreshold?: number;
  driverInvert?: boolean; // if true, on when driver < threshold
}

export interface LabDashboard {
  missionId: string;
  title: string;
  emoji: string;
  description: string;
  metrics: MetricDef[];
}

const C = {
  yellow: "hsl(var(--game-yellow))",
  orange: "hsl(var(--game-orange))",
  teal: "hsl(var(--game-teal))",
  pink: "hsl(var(--game-pink))",
  purple: "hsl(var(--game-purple))",
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  destructive: "hsl(var(--destructive))",
  secondary: "hsl(var(--secondary))",
};

export const labDashboards: LabDashboard[] = [
  {
    missionId: "smart-lights",
    title: "Smart Street Lights",
    emoji: "💡",
    description: "Voltage drawn by the lamp and its ON/OFF state vs ambient light.",
    metrics: [
      { key: "Light Level", label: "Ambient light", unit: "lux", kind: "line", color: C.yellow, base: 400, amplitude: 350, noise: 40, min: 0, max: 1000 },
      { key: "Lamp Voltage", label: "Lamp voltage", unit: "V", kind: "line", color: C.orange, base: 0, amplitude: 0, noise: 0.2, drivenBy: "Light Level", driverThreshold: 300, driverInvert: true, min: 0, max: 12 },
      { key: "Lamp State", label: "Lamp", kind: "state", color: C.accent, base: 0, amplitude: 1, noise: 0, drivenBy: "Light Level", driverThreshold: 300, driverInvert: true },
    ],
  },
  {
    missionId: "smart-parking",
    title: "Smart Parking",
    emoji: "🅿️",
    description: "Cars currently parked, free slots and barrier state.",
    metrics: [
      { key: "Cars in Park", label: "Cars in park", unit: "cars", kind: "count", color: C.primary, base: 6, amplitude: 4, noise: 1, min: 0, max: 10 },
      { key: "Available Slots", label: "Free slots", unit: "slots", kind: "count", color: C.secondary, base: 4, amplitude: 4, noise: 1, min: 0, max: 10 },
      { key: "Barrier State", label: "Barrier", kind: "state", color: C.accent, base: 0, amplitude: 1, noise: 0 },
    ],
  },
  {
    missionId: "water-monitor",
    title: "Water Level Monitor",
    emoji: "🌊",
    description: "Live water level and flood alarm status.",
    metrics: [
      { key: "Water Level", label: "Water level", unit: "cm", kind: "line", color: C.primary, base: 70, amplitude: 40, noise: 8, min: 0, max: 200 },
      { key: "Flood Alarm", label: "Alarm", kind: "state", color: C.destructive, base: 0, amplitude: 1, noise: 0, drivenBy: "Water Level", driverThreshold: 110 },
    ],
  },
  {
    missionId: "smart-traffic",
    title: "Smart Traffic Control",
    emoji: "🚦",
    description: "Cars per direction and active green light.",
    metrics: [
      { key: "Cars North", label: "Cars north", unit: "cars", kind: "count", color: C.purple, base: 8, amplitude: 6, noise: 2, min: 0, max: 30 },
      { key: "Cars South", label: "Cars south", unit: "cars", kind: "count", color: C.teal, base: 6, amplitude: 6, noise: 2, min: 0, max: 30 },
      { key: "Green Duration", label: "Green time", unit: "s", kind: "line", color: C.accent, base: 25, amplitude: 12, noise: 3, min: 5, max: 60 },
    ],
  },
  {
    missionId: "smart-garden",
    title: "Automated City Garden",
    emoji: "🌱",
    description: "Soil moisture and water pump activity.",
    metrics: [
      { key: "Soil Moisture", label: "Soil moisture", unit: "%", kind: "line", color: C.teal, base: 45, amplitude: 25, noise: 5, min: 0, max: 100 },
      { key: "Pump State", label: "Pump", kind: "state", color: C.primary, base: 0, amplitude: 1, noise: 0, drivenBy: "Soil Moisture", driverThreshold: 30, driverInvert: true },
    ],
  },
  {
    missionId: "air-quality",
    title: "Air Quality Guardian",
    emoji: "🏭",
    description: "PM2.5 and CO₂ readings around the factory.",
    metrics: [
      { key: "PM2.5", label: "PM2.5", unit: "µg/m³", kind: "line", color: C.destructive, base: 35, amplitude: 25, noise: 6, min: 0, max: 200 },
      { key: "CO2", label: "CO₂", unit: "ppm", kind: "line", color: C.orange, base: 600, amplitude: 250, noise: 40, min: 300, max: 2000 },
      { key: "Ventilation", label: "Fan", kind: "state", color: C.teal, base: 0, amplitude: 1, noise: 0, drivenBy: "PM2.5", driverThreshold: 50 },
    ],
  },
  {
    missionId: "fire-alarm",
    title: "Smart Fire Detection",
    emoji: "🔥",
    description: "Heat and smoke detection across the building.",
    metrics: [
      { key: "Temperature", label: "Temperature", unit: "°C", kind: "line", color: C.destructive, base: 24, amplitude: 6, noise: 1, min: 15, max: 80 },
      { key: "Smoke", label: "Smoke level", unit: "ppm", kind: "line", color: C.purple, base: 10, amplitude: 8, noise: 3, min: 0, max: 200 },
      { key: "Fire Alarm", label: "Alarm", kind: "state", color: C.destructive, base: 0, amplitude: 1, noise: 0, drivenBy: "Smoke", driverThreshold: 30 },
    ],
  },
  {
    missionId: "noise-monitor",
    title: "Noise Pollution Tracker",
    emoji: "🔊",
    description: "Real-time decibel levels at the construction site.",
    metrics: [
      { key: "Decibels", label: "Noise", unit: "dB", kind: "line", color: C.pink, base: 65, amplitude: 20, noise: 4, min: 30, max: 120 },
      { key: "Warning", label: "Warning sign", kind: "state", color: C.destructive, base: 0, amplitude: 1, noise: 0, drivenBy: "Decibels", driverThreshold: 85 },
    ],
  },
  {
    missionId: "smart-school",
    title: "Smart School Energy",
    emoji: "🏫",
    description: "Energy consumption, classroom temperature and occupancy.",
    metrics: [
      { key: "Energy kWh", label: "Energy", unit: "kWh", kind: "line", color: C.yellow, base: 18, amplitude: 8, noise: 1.5, min: 0, max: 50 },
      { key: "Room Temperature", label: "Room temp", unit: "°C", kind: "line", color: C.orange, base: 22, amplitude: 3, noise: 0.5, min: 15, max: 30 },
      { key: "Occupancy", label: "People", unit: "ppl", kind: "count", color: C.primary, base: 120, amplitude: 80, noise: 10, min: 0, max: 400 },
    ],
  },
  {
    missionId: "secure-data",
    title: "Blockchain Data Vault",
    emoji: "🔐",
    description: "Verified blocks added and tamper attempts blocked.",
    metrics: [
      { key: "Blocks Verified", label: "Blocks verified", unit: "blocks", kind: "count", color: C.purple, base: 12, amplitude: 6, noise: 1, min: 0, max: 100 },
      { key: "Tamper Attempts", label: "Tamper attempts", unit: "tries", kind: "count", color: C.destructive, base: 1, amplitude: 2, noise: 1, min: 0, max: 20 },
    ],
  },
  {
    missionId: "smart-hospital",
    title: "Hospital Patient Monitor",
    emoji: "🏥",
    description: "Patient vital signs streamed from the ward.",
    metrics: [
      { key: "Heart Rate", label: "Heart rate", unit: "bpm", kind: "line", color: C.destructive, base: 78, amplitude: 12, noise: 3, min: 40, max: 160 },
      { key: "Body Temp", label: "Body temp", unit: "°C", kind: "line", color: C.orange, base: 36.8, amplitude: 0.6, noise: 0.15, min: 34, max: 41 },
      { key: "Beds Occupied", label: "Beds used", unit: "beds", kind: "count", color: C.primary, base: 14, amplitude: 4, noise: 1, min: 0, max: 30 },
    ],
  },
  {
    missionId: "smart-bridge",
    title: "Bridge Health Monitor",
    emoji: "🌉",
    description: "Vibration intensity and engineer warnings.",
    metrics: [
      { key: "Vibration", label: "Vibration", unit: "mm/s", kind: "line", color: C.teal, base: 2.4, amplitude: 1.8, noise: 0.4, min: 0, max: 15 },
      { key: "Warning", label: "Engineer alert", kind: "state", color: C.destructive, base: 0, amplitude: 1, noise: 0, drivenBy: "Vibration", driverThreshold: 5 },
    ],
  },
];

export function dashboardForMission(missionId: string) {
  return labDashboards.find((d) => d.missionId === missionId);
}
