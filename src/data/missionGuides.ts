// Step-by-step "what & why" tutor text for every mission.
// Shown inside MissionModal so kids understand the wiring & code choices.

export type MissionGuide = {
  wiring: string;
  code: string;
  why: string;
};

export const missionGuides: Record<string, MissionGuide> = {
  "smart-lights": {
    wiring:
      "Plug the Light Sensor (LDR) into an ANALOG pin (e.g. A0) because it gives a value from 0 (dark) to 1023 (bright). Wire the street lamp to a digital output pin like D9, with a small resistor in series to protect it.",
    code: "Read the light sensor value. IF light value < 300 (it's dark outside) → turn the Light ON. ELSE → turn the Light OFF.",
    why: "A light sensor alone is enough: a street light only needs to know if it's day or night. We don't add a motion sensor here because public street lamps should stay on all night so roads are safe — not only when someone walks by. Analog pins are used for sensors that give a range of values (light level), while digital pins drive ON/OFF devices like the Light.",
  },
  "water-monitor": {
    wiring:
      "Connect the Water Level Sensor to ANALOG pin A0 — water height changes the voltage. Wire the Alarm (buzzer) and the SMS Alert module to digital output pins (e.g. D8 and D7).",
    code: "Read the water value. IF level > danger threshold (e.g. 700) → turn Alarm ON and trigger SMS Alert. ELSE keep them OFF.",
    why: "We use a threshold instead of an exact number because water rises slowly. Using two actuators (loud alarm + SMS) makes sure people are warned even if they're not nearby.",
  },
  "smart-traffic": {
    wiring:
      "Car Counter and Camera Sensor go on ANALOG pins (A0, A1) to read traffic density numbers. The Traffic Light is wired to 3 digital output pins (red/yellow/green, e.g. D11, D12, D13).",
    code: "Compare the count from each road. IF road A has more cars than road B → keep A green longer. Use a Timer so signals don't switch too fast.",
    why: "Real traffic lights waste time on empty roads. Counting cars lets the system give green to the busy direction. A timer prevents dangerous instant switching.",
  },
  "air-quality": {
    wiring:
      "Air Quality Sensor and Wind Sensor → ANALOG pins (A0, A1). Ventilation Fan and Warning Display → digital output pins (D9, D10).",
    code: "IF air quality value > pollution threshold → turn Ventilation Fan ON and show warning on Display. ELSE fan OFF.",
    why: "Air sensors measure pollution as a number, so analog reading is essential. The fan removes bad air automatically; the display warns humans — IoT helps both the machine and the people.",
  },
  "smart-school": {
    wiring:
      "Energy Meter, Temperature Sensor, Occupancy Sensor → ANALOG pins (A0–A2). HVAC Controller and Smart Plug → digital output pins (D8, D9).",
    code: "Log readings over time. IF occupancy == 0 AND temperature in safe range → turn HVAC OFF and cut Smart Plug. Use AI Predict block to learn busy hours.",
    why: "Empty rooms don't need heating or cooling — that's where most schools waste energy. Logging data lets the AI block predict patterns and act before peak hours.",
  },
  "secure-data": {
    wiring:
      "Data Logger and Network Monitor → ANALOG pins (A0, A1) to capture sensor streams. Blockchain Node and Alert System → digital output pins (D7, D8).",
    code: "Every reading creates a block: { data, previous_hash, new_hash }. IF a new hash doesn't match the chain → trigger Alert System.",
    why: "Blockchain links readings with hashes, so if anyone changes one value the whole chain breaks. The alert system immediately tells the city that data was tampered with.",
  },
  "smart-parking": {
    wiring:
      "Motion Sensor → digital pin D2 (it's ON/OFF when a car is above it). LED Light → D9, Display → D10.",
    code: "IF motion detected → LED RED (spot taken). ELSE → LED GREEN (free). Show the count of free spots on the Display.",
    why: "Drivers only need to know 'free or taken', so a digital sensor is enough. Color-coded LEDs are faster to understand than text from far away.",
  },
  "smart-garden": {
    wiring:
      "Water Level / Soil Moisture Sensor → ANALOG pin A0. Motor (water pump) → digital output pin D9.",
    code: "Read moisture. IF moisture < dry threshold → turn Motor ON for a few seconds. ELSE keep Motor OFF.",
    why: "Plants need water only when soil is dry. An analog reading gives a precise dryness level so we don't drown the plants.",
  },
  "fire-alarm": {
    wiring:
      "Temperature Sensor and Air Quality (smoke) Sensor → ANALOG pins A0 & A1. Alarm and SMS Alert → digital output pins D7 & D8.",
    code: "IF temperature rises fast OR smoke value > threshold → trigger Alarm AND SMS Alert at the same time.",
    why: "Using TWO sensors avoids false alarms — a hot day alone won't ring it; you need heat + smoke. Triggering two actuators at once warns people inside AND outside.",
  },
  "noise-monitor": {
    wiring:
      "Sound Sensor → ANALOG pin A0 (decibels are a range, not ON/OFF). Display → D9, Warning Display → D10.",
    code: "Read decibels. IF noise > limit → show value on Display in red AND turn ON Warning Display. Log every reading.",
    why: "Noise is a continuous value, so analog is required. Logging helps prove to authorities when limits were broken.",
  },
  "smart-hospital": {
    wiring:
      "Temperature Sensor and Occupancy Sensor → ANALOG pins A0 & A1. Alarm, Display, SMS Alert → digital output pins D7, D8, D9.",
    code: "Continuously read vitals with a Timer. IF temperature outside safe range → Alarm + SMS to nurse + show patient ID on Display. Use AI Predict to spot abnormal trends early.",
    why: "Patients can change condition in seconds, so we read constantly. Multiple alerts ensure a nurse will see it even if they're away from the screen.",
  },
  "smart-bridge": {
    wiring:
      "Motion (vibration) Sensor → ANALOG pin A0. Data Logger → A1. Warning Display & SMS Alert → digital pins D8 & D9.",
    code: "Log vibration values every second. IF vibration > danger level for more than X readings → SMS engineers AND show warning.",
    why: "One spike could be a truck; many spikes mean real damage. Requiring repeated high readings avoids false alarms and protects the bridge.",
  },
};
