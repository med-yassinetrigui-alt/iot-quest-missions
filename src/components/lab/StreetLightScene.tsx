import { motion } from "framer-motion";
import lightingSceneOff from "@/assets/lighting-scene-off.jpg";

interface StreetLightSceneProps {
  /** When true → simulate it being dark (sensor reads low light) */
  isDark?: boolean;
  /** When true → lamp is wired correctly to Arduino */
  isWired?: boolean;
  /** When true → code logic is valid: lamp should turn ON in the dark */
  codeValid?: boolean;
  /** Variant: 'intro' = big still photo, 'lab' = live simulation */
  variant?: "intro" | "lab";
}

export default function StreetLightScene({
  isDark = true,
  isWired = false,
  codeValid = false,
  variant = "lab",
}: StreetLightSceneProps) {
  const lampOn = isWired && codeValid && isDark;

  if (variant === "intro") {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-destructive/60 shadow-lg">
        <img
          src={lightingSceneOff}
          alt="Evening city street with all street lights turned off — broken lighting system"
          loading="lazy"
          width={1024}
          height={1024}
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute top-2 left-2 right-2 flex items-center gap-2 bg-destructive text-destructive-foreground rounded-xl px-3 py-1.5 shadow">
          <span className="text-lg animate-pulse">🚨</span>
          <p className="text-xs font-display font-bold">
            All street lights are OFF — the city is dangerous in the dark!
          </p>
        </div>
        <div className="absolute bottom-2 left-2 bg-card/90 rounded-lg px-2 py-1 text-[10px] font-body font-semibold text-foreground">
          📍 Downtown · 8:42 PM
        </div>
      </div>
    );
  }

  // LAB simulation — realistic animated street light
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-border bg-card">
      <div className="flex items-center justify-between px-3 py-2 bg-muted">
        <h4 className="font-display text-xs font-bold text-foreground">🛣️ Live Street Simulation</h4>
        <span
          className={`text-[10px] font-display font-bold px-2 py-0.5 rounded ${
            lampOn ? "bg-secondary text-secondary-foreground" : "bg-destructive text-destructive-foreground"
          }`}
        >
          Lamp: {lampOn ? "ON" : "OFF"}
        </span>
      </div>

      {/* Scene */}
      <div
        className="relative h-64 overflow-hidden transition-colors duration-700"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, hsl(245 40% 12%) 0%, hsl(250 35% 18%) 60%, hsl(220 20% 25%) 100%)"
            : "linear-gradient(to bottom, hsl(200 80% 70%) 0%, hsl(45 90% 75%) 100%)",
        }}
      >
        {/* Stars (dark only) */}
        {isDark &&
          [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-primary-foreground rounded-full"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 13) % 40}%` }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.1 }}
            />
          ))}

        {/* Buildings silhouette */}
        <div className="absolute bottom-16 left-0 right-0 flex items-end gap-1 px-2">
          {[40, 60, 35, 70, 50, 55, 45, 65].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-foreground/70 rounded-t"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-foreground/90">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 flex gap-2 px-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-primary-foreground/80" />
            ))}
          </div>
        </div>

        {/* Street lamp */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          {/* Light glow */}
          {lampOn && (
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, hsl(45 100% 70% / 0.55) 0%, hsl(45 100% 60% / 0.2) 40%, transparent 70%)",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}
          {/* Lamp arm */}
          <div className="relative">
            <div className="w-1 h-32 bg-foreground mx-auto" />
            <div className="absolute top-0 left-1/2 w-10 h-1 bg-foreground -translate-x-1/2" />
            {/* Lamp head */}
            <div
              className={`absolute -top-1 left-1/2 -translate-x-[150%] w-8 h-5 rounded-b-lg border-2 border-foreground transition-all duration-300 ${
                lampOn
                  ? "bg-yellow-300 shadow-[0_0_20px_8px_rgba(253,224,71,0.7)]"
                  : "bg-muted-foreground/40"
              }`}
            />
          </div>
        </div>

        {/* Status pill */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 text-[10px] font-display font-bold">
          <span className="bg-card/85 text-foreground px-2 py-1 rounded">
            ☀️ Light sensor: {isDark ? "LOW (dark)" : "HIGH (bright)"}
          </span>
          <span
            className={`px-2 py-1 rounded ${
              isWired ? "bg-secondary/30 text-secondary" : "bg-destructive/30 text-destructive"
            }`}
          >
            🔌 {isWired ? "Wired" : "Not wired"}
          </span>
        </div>

        {/* No-code overlay */}
        {!codeValid && (
          <div className="absolute bottom-1 left-2 bg-destructive/90 text-destructive-foreground text-[10px] font-display font-bold px-2 py-0.5 rounded">
            ⚠️ Program the logic to make the lamp react
          </div>
        )}
      </div>
    </div>
  );
}
