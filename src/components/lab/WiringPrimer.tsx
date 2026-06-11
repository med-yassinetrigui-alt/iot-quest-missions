import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * WiringPrimer — Kid-friendly explainer for Arduino wiring concepts:
 * analog vs digital pins, GND, VCC, 5V, 3.3V, and how to wire safely.
 */
export default function WiringPrimer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-secondary/10 to-primary/10 border-2 border-secondary/30 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/10 transition-colors"
      >
        <span className="text-3xl">🧑‍🏫</span>
        <div className="flex-1">
          <p className="font-display text-base font-extrabold text-foreground">
            Wiring 101 — Learn cabling & pins
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Analog vs Digital, GND, VCC, 5V, 3.3V — everything you need before connecting.
          </p>
        </div>
        <span className="font-display font-bold text-primary text-xl">{open ? "−" : "+"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3 text-sm font-body text-foreground/90">
              {/* What is cabling */}
              <div className="bg-card/70 rounded-xl p-3">
                <p className="font-display font-bold text-primary mb-1">🔌 What is "cabling" (câblage)?</p>
                <p className="leading-relaxed">
                  Cabling means connecting each component to the right pin on the Arduino with wires.
                  Every component needs <b>3 things</b>:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li><b>Power (VCC / 5V or 3.3V)</b> — gives it energy</li>
                  <li><b>Ground (GND)</b> — completes the circuit</li>
                  <li><b>Signal pin</b> — where data goes in or out (analog or digital)</li>
                </ul>
              </div>

              {/* Analog vs Digital */}
              <div className="grid md:grid-cols-2 gap-2">
                <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3">
                  <p className="font-display font-bold text-amber-600 dark:text-amber-400 mb-1">
                    🟡 Analog pins (A0–A5)
                  </p>
                  <p className="text-xs leading-relaxed">
                    Read a <b>range of values from 0 to 1023</b>. Think of a volume knob — not just
                    "on/off" but "how much".
                  </p>
                  <p className="text-xs mt-1"><b>Use for sensors:</b> light, temperature, moisture, sound…</p>
                </div>
                <div className="bg-zinc-400/10 border border-zinc-400/40 rounded-xl p-3">
                  <p className="font-display font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    ⚪ Digital pins (D2–D13)
                  </p>
                  <p className="text-xs leading-relaxed">
                    Only two states: <b>HIGH (1 = 5V)</b> or <b>LOW (0 = 0V)</b>. Like a light switch.
                  </p>
                  <p className="text-xs mt-1"><b>Use for actuators:</b> LEDs, buzzers, relays, servos…</p>
                </div>
              </div>

              {/* Bit vs Byte */}
              <div className="bg-card/70 rounded-xl p-3">
                <p className="font-display font-bold text-accent mb-1">🔢 Bit, byte & 1023?</p>
                <p className="leading-relaxed text-xs">
                  A <b>bit</b> = a single 0 or 1 (what digital pins use).
                  Analog pins use a <b>10-bit converter (ADC)</b>, so they give numbers from
                  <b> 0 to 1023</b> (that's 2<sup>10</sup> = 1024 steps). 0 = no voltage, 1023 = full 5V.
                </p>
              </div>

              {/* Power pins */}
              <div className="bg-card/70 rounded-xl p-3">
                <p className="font-display font-bold text-secondary mb-1">⚡ Power pins explained</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    <span className="inline-block w-3 h-3 rounded-sm bg-red-600 mr-1 align-middle" />
                    <b>5V</b> — main power for most sensors and actuators (Arduino's standard voltage).
                  </li>
                  <li>
                    <span className="inline-block w-3 h-3 rounded-sm bg-orange-500 mr-1 align-middle" />
                    <b>3.3V</b> — lower voltage for delicate parts (Wi-Fi modules, some sensors).
                  </li>
                  <li>
                    <span className="inline-block w-3 h-3 rounded-sm bg-zinc-800 border border-zinc-600 mr-1 align-middle" />
                    <b>GND (Ground)</b> — the "return path". Electricity must always travel in a loop —
                    from 5V → through the component → back to GND. Without GND, nothing works!
                  </li>
                  <li>
                    <b>VIN</b> — used to power the Arduino itself from an outside battery (7–12V).
                  </li>
                  <li>
                    <b>VCC</b> — a generic name written on components meaning "plug me into +5V"
                    (or +3.3V if specified).
                  </li>
                </ul>
              </div>

              {/* Wiring example */}
              <div className="bg-card/70 rounded-xl p-3">
                <p className="font-display font-bold text-primary mb-1">🛠️ Example: wiring an LDR (light sensor)</p>
                <ol className="list-decimal list-inside text-xs space-y-0.5">
                  <li><b>VCC</b> of the sensor → Arduino <b>5V</b></li>
                  <li><b>GND</b> of the sensor → Arduino <b>GND</b></li>
                  <li><b>Signal (OUT)</b> of the sensor → Arduino <b>A0</b> (analog!)</li>
                </ol>
                <p className="text-xs mt-2 italic text-muted-foreground">
                  In this game, we simplified things: just drop the component on the right colored pin —
                  amber for sensors (analog), grey for actuators (digital). Power & GND are handled
                  automatically. 🎮
                </p>
              </div>

              {/* Rules of thumb */}
              <div className="bg-primary/10 rounded-xl p-3">
                <p className="font-display font-bold text-foreground mb-1">📏 Golden rules</p>
                <ul className="list-disc list-inside text-xs space-y-0.5">
                  <li>Sensor with a range of values → <b>Analog pin (A0–A5)</b></li>
                  <li>Sensor with only ON/OFF (like a button) → <b>Digital pin (D2–D13)</b></li>
                  <li>Anything you turn on/off (LED, buzzer, relay) → <b>Digital pin</b></li>
                  <li>Servo motors → <b>PWM digital pin</b> (D3, D5, D6, D9, D10, D11)</li>
                  <li>Always connect <b>GND</b>! No GND = no circuit.</li>
                  <li>Never wire 5V directly to GND — that's a short-circuit 🔥</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
