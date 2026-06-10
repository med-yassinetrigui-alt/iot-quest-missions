// Per-mission code block palettes & validation rules so every lab has its
// own unique logic instead of a generic "read → if → write" template.

export interface MissionCodeBlock {
  id: string;
  type: "event" | "condition" | "action" | "loop" | "wait";
  label: string;
  icon: string;
  color: string;
  /** Optional C++ line to emit when this block is generated. {sensor} {actuator} are substituted. */
  code?: string;
}

export interface MissionCodeRecipe {
  /** Friendly description of the program shown at the top of the editor */
  goal: string;
  /** Available palette blocks for this mission */
  palette: MissionCodeBlock[];
  /** Block ids that MUST be placed for the program to be considered valid */
  required: string[];
}

// Shared building blocks that appear in most missions
const baseStart: MissionCodeBlock = { id: "on-start", type: "event", label: "When program starts", icon: "🟢", color: "bg-emerald-600" };
const baseLoop: MissionCodeBlock = { id: "on-loop", type: "loop", label: "Repeat forever", icon: "🔄", color: "bg-amber-600" };
const wait1s: MissionCodeBlock = { id: "wait-1s", type: "wait", label: "Wait 1 second", icon: "⏱️", color: "bg-orange-600" };
const wait500: MissionCodeBlock = { id: "wait-500ms", type: "wait", label: "Wait 500ms", icon: "⏱️", color: "bg-orange-600" };
const serial: MissionCodeBlock = { id: "serial-print", type: "action", label: "Print to serial", icon: "🖨️", color: "bg-purple-600" };

export const missionCodeRecipes: Record<string, MissionCodeRecipe> = {
  "smart-lights": {
    goal: "Turn the street light ON when it gets dark, OFF when it's bright.",
    palette: [
      baseStart, baseLoop,
      { id: "read-light", type: "action", label: "Read light sensor", icon: "☀️", color: "bg-yellow-600", code: "int light = analogRead(A0);" },
      { id: "if-dark", type: "condition", label: "If it's dark (light < 300)", icon: "🌙", color: "bg-blue-700", code: "if (light < 300) {" },
      { id: "lamp-on", type: "action", label: "Turn lamp ON", icon: "💡", color: "bg-amber-500", code: "digitalWrite(lampPin, HIGH);" },
      { id: "lamp-off", type: "action", label: "Turn lamp OFF", icon: "🌑", color: "bg-zinc-600", code: "digitalWrite(lampPin, LOW);" },
      serial, wait500,
    ],
    required: ["read-light", "if-dark", "lamp-on"],
  },

  "water-monitor": {
    goal: "Watch the river level and trigger a flood alert when it gets too high.",
    palette: [
      baseStart, baseLoop,
      { id: "read-water", type: "action", label: "Read water level", icon: "💧", color: "bg-sky-600", code: "int level = analogRead(A0);" },
      { id: "if-flood", type: "condition", label: "If level > flood limit", icon: "🌊", color: "bg-blue-700", code: "if (level > 700) {" },
      { id: "siren", type: "action", label: "Sound flood siren", icon: "🚨", color: "bg-red-600", code: "digitalWrite(sirenPin, HIGH);" },
      { id: "sms-alert", type: "action", label: "Send SMS alert", icon: "📱", color: "bg-pink-600", code: "sendSMS(\"FLOOD\");" },
      serial, wait1s,
    ],
    required: ["read-water", "if-flood", "siren"],
  },

  "smart-traffic": {
    goal: "Cycle the traffic lights and turn green when many cars are waiting.",
    palette: [
      baseStart, baseLoop,
      { id: "count-cars", type: "action", label: "Count cars", icon: "🚗", color: "bg-orange-600", code: "int cars = countCars();" },
      { id: "if-jam", type: "condition", label: "If cars > 5 (traffic jam)", icon: "🚦", color: "bg-blue-700", code: "if (cars > 5) {" },
      { id: "light-green", type: "action", label: "Green light", icon: "🟢", color: "bg-green-600", code: "setLight(GREEN);" },
      { id: "light-yellow", type: "action", label: "Yellow light", icon: "🟡", color: "bg-yellow-500", code: "setLight(YELLOW);" },
      { id: "light-red", type: "action", label: "Red light", icon: "🔴", color: "bg-red-600", code: "setLight(RED);" },
      wait1s,
    ],
    required: ["count-cars", "if-jam", "light-green", "light-red"],
  },

  "air-quality": {
    goal: "Monitor air quality and warn citizens when pollution is high.",
    palette: [
      baseStart, baseLoop,
      { id: "read-co2", type: "action", label: "Read CO₂ level", icon: "💨", color: "bg-teal-600", code: "int co2 = readCO2();" },
      { id: "if-polluted", type: "condition", label: "If CO₂ > 800ppm", icon: "☣️", color: "bg-blue-700", code: "if (co2 > 800) {" },
      { id: "show-warn", type: "action", label: "Show ⚠️ on display", icon: "📺", color: "bg-purple-600", code: "display(\"AIR ALERT\");" },
      { id: "led-red", type: "action", label: "Red status LED", icon: "🔴", color: "bg-red-600", code: "digitalWrite(ledPin, HIGH);" },
      { id: "led-green", type: "action", label: "Green status LED", icon: "🟢", color: "bg-green-600", code: "digitalWrite(ledPin, LOW);" },
      serial, wait1s,
    ],
    required: ["read-co2", "if-polluted", "show-warn"],
  },

  "smart-school": {
    goal: "Ring the bell at class time and detect when students enter the room.",
    palette: [
      baseStart, baseLoop,
      { id: "read-motion", type: "action", label: "Read motion sensor", icon: "👁️", color: "bg-purple-600", code: "int m = digitalRead(motionPin);" },
      { id: "read-time", type: "action", label: "Get current time", icon: "⏰", color: "bg-indigo-600", code: "int t = millis()/1000;" },
      { id: "if-motion", type: "condition", label: "If movement detected", icon: "🚶", color: "bg-blue-700", code: "if (m == HIGH) {" },
      { id: "ring-bell", type: "action", label: "Ring school bell", icon: "🔔", color: "bg-amber-600", code: "tone(buzzerPin, 1000, 500);" },
      { id: "count-student", type: "action", label: "Count one student", icon: "🧑‍🎓", color: "bg-pink-600", code: "students++;" },
      serial,
    ],
    required: ["read-motion", "if-motion", "ring-bell"],
  },

  "secure-data": {
    goal: "Hash citizen data and write it to the blockchain ledger.",
    palette: [
      baseStart,
      { id: "read-data", type: "action", label: "Read incoming data", icon: "💾", color: "bg-slate-600", code: "String data = readInput();" },
      { id: "hash", type: "action", label: "Hash with SHA-256", icon: "🔐", color: "bg-purple-700", code: "String h = sha256(data);" },
      { id: "if-valid", type: "condition", label: "If hash is valid", icon: "✅", color: "bg-blue-700", code: "if (verifyHash(h)) {" },
      { id: "write-chain", type: "action", label: "Write to blockchain", icon: "⛓️", color: "bg-violet-700", code: "blockchain.append(h);" },
      { id: "reject", type: "action", label: "Reject transaction", icon: "🛑", color: "bg-red-600", code: "logReject();" },
      serial,
    ],
    required: ["read-data", "hash", "write-chain"],
  },

  "smart-parking": {
    goal: "Count parked cars, open the barrier when a spot is free.",
    palette: [
      baseStart, baseLoop,
      { id: "read-slot", type: "action", label: "Scan parking slots", icon: "🅿️", color: "bg-orange-600", code: "int taken = scanSlots();" },
      { id: "calc-free", type: "action", label: "Compute free spots", icon: "🔢", color: "bg-cyan-600", code: "int free = TOTAL - taken;" },
      { id: "if-free", type: "condition", label: "If free > 0", icon: "🚙", color: "bg-blue-700", code: "if (free > 0) {" },
      { id: "open-gate", type: "action", label: "Open barrier", icon: "⬆️", color: "bg-green-600", code: "servo.write(90);" },
      { id: "close-gate", type: "action", label: "Close barrier", icon: "⬇️", color: "bg-red-600", code: "servo.write(0);" },
      { id: "show-count", type: "action", label: "Show free count on display", icon: "📺", color: "bg-purple-600", code: "display(free);" },
    ],
    required: ["read-slot", "if-free", "open-gate", "show-count"],
  },

  "smart-garden": {
    goal: "Water the plants automatically when the soil is dry.",
    palette: [
      baseStart, baseLoop,
      { id: "read-soil", type: "action", label: "Read soil moisture", icon: "🌱", color: "bg-emerald-600", code: "int soil = analogRead(A1);" },
      { id: "if-dry", type: "condition", label: "If soil is dry (< 400)", icon: "🏜️", color: "bg-blue-700", code: "if (soil < 400) {" },
      { id: "pump-on", type: "action", label: "Start water pump", icon: "💦", color: "bg-sky-600", code: "digitalWrite(pumpPin, HIGH);" },
      { id: "pump-off", type: "action", label: "Stop water pump", icon: "🚱", color: "bg-zinc-600", code: "digitalWrite(pumpPin, LOW);" },
      wait1s,
    ],
    required: ["read-soil", "if-dry", "pump-on", "pump-off"],
  },

  "fire-alarm": {
    goal: "Detect smoke + heat and trigger the fire alarm fast.",
    palette: [
      baseStart, baseLoop,
      { id: "read-smoke", type: "action", label: "Read smoke sensor", icon: "💨", color: "bg-gray-600", code: "int smoke = analogRead(A0);" },
      { id: "read-temp", type: "action", label: "Read temperature", icon: "🌡️", color: "bg-red-500", code: "int t = readTemp();" },
      { id: "if-fire", type: "condition", label: "If smoke high AND temp > 60°C", icon: "🔥", color: "bg-blue-700", code: "if (smoke > 600 && t > 60) {" },
      { id: "alarm-on", type: "action", label: "Trigger alarm 🚨", icon: "🚨", color: "bg-red-700", code: "digitalWrite(alarmPin, HIGH);" },
      { id: "call-fire", type: "action", label: "Call fire department", icon: "📞", color: "bg-orange-700", code: "sendSMS(\"FIRE\");" },
      wait500,
    ],
    required: ["read-smoke", "read-temp", "if-fire", "alarm-on"],
  },

  "noise-monitor": {
    goal: "Measure noise levels and flag noisy areas of the city.",
    palette: [
      baseStart, baseLoop,
      { id: "read-noise", type: "action", label: "Read sound level (dB)", icon: "🎙️", color: "bg-pink-600", code: "int db = readSound();" },
      { id: "if-loud", type: "condition", label: "If dB > 70 (too loud)", icon: "📢", color: "bg-blue-700", code: "if (db > 70) {" },
      { id: "log-noise", type: "action", label: "Log noise event", icon: "💾", color: "bg-slate-600", code: "logger.write(db);" },
      { id: "show-db", type: "action", label: "Show dB on display", icon: "📺", color: "bg-purple-600", code: "display(db);" },
      wait1s,
    ],
    required: ["read-noise", "if-loud", "log-noise"],
  },

  "smart-hospital": {
    goal: "Track patient heart rate and alert nurses if it's abnormal.",
    palette: [
      baseStart, baseLoop,
      { id: "read-hr", type: "action", label: "Read heart rate (BPM)", icon: "❤️", color: "bg-rose-600", code: "int bpm = readHeart();" },
      { id: "if-low", type: "condition", label: "If BPM < 50", icon: "🐢", color: "bg-blue-700", code: "if (bpm < 50) {" },
      { id: "if-high", type: "condition", label: "If BPM > 120", icon: "🐇", color: "bg-blue-700", code: "if (bpm > 120) {" },
      { id: "nurse-alert", type: "action", label: "Page the nurse", icon: "🏥", color: "bg-red-600", code: "pageNurse(bpm);" },
      { id: "log-vital", type: "action", label: "Save vitals to record", icon: "📋", color: "bg-emerald-600", code: "saveVitals(bpm);" },
      wait1s,
    ],
    required: ["read-hr", "nurse-alert", "log-vital"],
  },

  "smart-bridge": {
    goal: "Watch wind & vibration on the bridge and close it if unsafe.",
    palette: [
      baseStart, baseLoop,
      { id: "read-wind", type: "action", label: "Read wind speed", icon: "🌬️", color: "bg-cyan-600", code: "int wind = readWind();" },
      { id: "read-vib", type: "action", label: "Read vibration", icon: "📳", color: "bg-amber-600", code: "int vib = readVibration();" },
      { id: "if-unsafe", type: "condition", label: "If wind > 80 OR vib > 50", icon: "⚠️", color: "bg-blue-700", code: "if (wind > 80 || vib > 50) {" },
      { id: "close-bridge", type: "action", label: "Close the bridge", icon: "🚧", color: "bg-red-700", code: "closeBridge();" },
      { id: "warn-display", type: "action", label: "Show warning sign", icon: "📺", color: "bg-purple-600", code: "display(\"BRIDGE CLOSED\");" },
      wait1s,
    ],
    required: ["read-wind", "read-vib", "if-unsafe", "close-bridge"],
  },
};

export function recipeForMission(missionId: string): MissionCodeRecipe {
  return (
    missionCodeRecipes[missionId] ?? {
      goal: "Build your IoT program.",
      palette: [
        baseStart, baseLoop,
        { id: "read-generic", type: "action", label: "Read sensor", icon: "📡", color: "bg-purple-600", code: "int v = analogRead(A0);" },
        { id: "if-generic", type: "condition", label: "If value > 500", icon: "📊", color: "bg-blue-700", code: "if (v > 500) {" },
        { id: "out-high", type: "action", label: "Set output HIGH", icon: "⬆️", color: "bg-green-600", code: "digitalWrite(outPin, HIGH);" },
        { id: "out-low", type: "action", label: "Set output LOW", icon: "⬇️", color: "bg-zinc-600", code: "digitalWrite(outPin, LOW);" },
        serial, wait1s,
      ],
      required: ["read-generic", "if-generic", "out-high"],
    }
  );
}
