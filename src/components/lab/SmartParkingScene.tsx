import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import parkingSceneBroken from "@/assets/parking-scene-broken.jpg";

interface SmartParkingSceneProps {
  /** When true → a car has arrived at the gate */
  carPresent?: boolean;
  /** When true → barrier is wired correctly to Arduino */
  isWired?: boolean;
  /** When true → code logic is valid */
  codeValid?: boolean;
  /** Variant: 'intro' = big still photo, 'lab' = live simulation */
  variant?: "intro" | "lab";
}

type Phase = "approaching" | "waiting" | "entering" | "inside";

export default function SmartParkingScene({
  carPresent = false,
  isWired = false,
  codeValid = false,
  variant = "lab",
}: SmartParkingSceneProps) {
  const systemReady = isWired && codeValid;
  const [phase, setPhase] = useState<Phase>("approaching");

  // Drive the simulation when a car is requested
  useEffect(() => {
    if (variant !== "lab") return;
    if (!carPresent) {
      setPhase("approaching");
      return;
    }
    // approach → waiting → entering → inside → reset
    setPhase("approaching");
    const t1 = setTimeout(() => setPhase("waiting"), 1500);
    const t2 = setTimeout(() => setPhase(systemReady ? "entering" : "waiting"), 2800);
    const t3 = setTimeout(() => systemReady && setPhase("inside"), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [carPresent, systemReady, variant]);

  // Barrier opens only when car is detected AND system is ready
  const barrierOpen = carPresent && systemReady && (phase === "entering");

  if (variant === "intro") {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-destructive/60 shadow-lg">
        <img
          src={parkingSceneBroken}
          alt="Smart parking lot with the entry barrier broken and cars waiting outside"
          loading="lazy"
          width={1280}
          height={768}
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-0 bg-foreground/25" />
        <div className="absolute top-2 left-2 right-2 flex items-center gap-2 bg-destructive text-destructive-foreground rounded-xl px-3 py-1.5 shadow">
          <span className="text-lg animate-pulse">🚨</span>
          <p className="text-xs font-display font-bold">
            Parking barrier is broken — cars are stuck outside!
          </p>
        </div>
        <div className="absolute bottom-2 left-2 bg-card/90 rounded-lg px-2 py-1 text-[10px] font-body font-semibold text-foreground">
          📍 Downtown Parking · Entry closed
        </div>
      </div>
    );
  }

  // LAB simulation
  const carX =
    phase === "approaching" ? "-20%" :
    phase === "waiting" ? "30%" :
    phase === "entering" ? "55%" :
    "95%";

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-border bg-card">
      <div className="flex items-center justify-between px-3 py-2 bg-muted">
        <h4 className="font-display text-xs font-bold text-foreground">🅿️ Live Parking Simulation</h4>
        <span
          className={`text-[10px] font-display font-bold px-2 py-0.5 rounded ${
            barrierOpen ? "bg-secondary text-secondary-foreground" : "bg-destructive text-destructive-foreground"
          }`}
        >
          Barrier: {barrierOpen ? "OPEN" : "CLOSED"}
        </span>
      </div>

      <div
        className="relative h-64 overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, hsl(200 70% 75%) 0%, hsl(200 50% 85%) 55%, hsl(120 25% 55%) 56%, hsl(120 25% 45%) 100%)",
        }}
      >
        {/* Sun */}
        <div className="absolute top-3 right-6 w-8 h-8 rounded-full bg-[hsl(48,100%,75%)] shadow-[0_0_18px_6px_hsl(48,100%,80%,0.6)]" />

        {/* Buildings */}
        <div className="absolute top-16 left-0 right-0 flex items-end gap-1 px-2 opacity-70">
          {[34, 50, 28, 56, 40].map((h, i) => (
            <div key={i} className="flex-1 bg-foreground/60 rounded-t" style={{ height: `${h}px` }} />
          ))}
        </div>

        {/* Road / parking surface */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-foreground/85">
          {/* Parking spot lines (inside) */}
          <div className="absolute top-3 right-2 left-[60%] h-20 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 border-2 border-dashed border-primary-foreground/70 rounded-sm" />
            ))}
          </div>
          {/* Road dashed line */}
          <div className="absolute top-1/2 left-0 w-[55%] h-0.5 flex gap-2 px-2 -translate-y-1/2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-primary-foreground/80" />
            ))}
          </div>
        </div>

        {/* Sensor (ultrasonic) post on left side */}
        <div className="absolute bottom-24 left-[42%]">
          <div className="w-3 h-10 bg-foreground rounded-sm" />
          <div className={`absolute -top-1 -left-1 w-5 h-3 rounded ${carPresent ? "bg-secondary" : "bg-muted"} border border-foreground`} />
          {carPresent && phase !== "inside" && (
            <motion.div
              className="absolute top-0 -left-6 w-4 h-4 rounded-full border-2 border-secondary"
              animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Barrier base (left pillar) */}
        <div className="absolute bottom-20 left-[48%] w-3 h-12 bg-zinc-600 border border-foreground rounded-sm" />
        {/* Barrier arm — rotates around the left pillar */}
        <motion.div
          className="absolute bottom-[112px] left-[49%] h-1.5 w-20 origin-left rounded-sm"
          style={{
            background: "repeating-linear-gradient(90deg, hsl(0 80% 55%) 0 12px, hsl(0 0% 100%) 12px 24px)",
            border: "1px solid hsl(0 0% 15%)",
          }}
          animate={{ rotate: barrierOpen ? -85 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        />
        {/* Barrier base (right pillar / catcher) */}
        <div className="absolute bottom-20 left-[68%] w-2 h-8 bg-zinc-500 border border-foreground rounded-sm" />

        {/* Car */}
        <motion.div
          className="absolute bottom-[88px]"
          style={{ left: carX }}
          animate={{ left: carX }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <div className="relative">
            {/* Body */}
            <div className="w-14 h-5 bg-primary rounded-md border-2 border-foreground" />
            {/* Cabin */}
            <div className="absolute -top-2 left-2 w-9 h-3 bg-primary/80 rounded-t-md border-2 border-foreground" />
            {/* Wheels */}
            <div className="absolute -bottom-1 left-1 w-3 h-3 rounded-full bg-foreground" />
            <div className="absolute -bottom-1 right-1 w-3 h-3 rounded-full bg-foreground" />
            {/* Headlight */}
            <div className="absolute top-1 -right-0.5 w-1 h-2 bg-[hsl(48,100%,80%)] rounded-r" />
          </div>
        </motion.div>

        {/* Status pills */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 text-[10px] font-display font-bold">
          <span className="bg-card/90 text-foreground px-2 py-1 rounded">
            📡 Sensor: {carPresent ? "CAR DETECTED" : "no car"}
          </span>
          <span
            className={`px-2 py-1 rounded ${
              isWired ? "bg-secondary/30 text-secondary" : "bg-muted text-muted-foreground"
            }`}
          >
            🔌 {isWired ? "Wired" : "Not wired"}
          </span>
        </div>

        {/* No-code overlay */}
        {!codeValid && (
          <div className="absolute bottom-1 left-2 bg-destructive/90 text-destructive-foreground text-[10px] font-display font-bold px-2 py-0.5 rounded">
            ⚠️ Program the logic so the servo opens the barrier
          </div>
        )}

        <AnimatePresence>
          {phase === "inside" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 right-2 bg-secondary text-secondary-foreground text-[10px] font-display font-bold px-2 py-0.5 rounded"
            >
              ✅ Car parked — barrier closing
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
