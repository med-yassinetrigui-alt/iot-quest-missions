import { motion, AnimatePresence } from "framer-motion";
import { Mission } from "@/types/game";

interface MissionMarkerProps {
  mission: Mission;
  onClick: () => void;
  isCompleted: boolean;
}

export default function MissionMarker({ mission, onClick, isCompleted }: MissionMarkerProps) {
  // All unsolved missions show as red alerts; completed turn green
  const difficultyColor = "bg-destructive";
  const difficultyBadge = {
    easy: "bg-secondary",
    medium: "bg-accent",
    hard: "bg-destructive",
  }[mission.difficulty];

  return (
    <motion.button
      className="absolute group"
      style={{ left: `${mission.location.x}%`, top: `${mission.location.y}%` }}
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, delay: Math.random() * 0.5 }}
    >
      {/* Alert pulse ring - red for unsolved problems */}
      {!isCompleted && mission.unlocked && (
        <>
          <span className="absolute inset-0 rounded-full alert-pulse bg-destructive/40 -m-2" />
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-extrabold flex items-center justify-center border-2 border-card shadow-md z-10 animate-pulse">!</span>
        </>
      )}

      {/* Marker */}
      <div
        className={`mission-marker relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-4 border-card shadow-lg ${
          isCompleted
            ? "bg-secondary"
            : mission.unlocked
            ? difficultyColor
            : "bg-muted opacity-60"
        }`}
      >
        {isCompleted ? "✅" : mission.unlocked ? mission.icon : "🔒"}
      </div>

      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="game-card p-2 px-3 text-xs whitespace-nowrap font-display font-bold text-card-foreground">
          {mission.title}
          <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] text-primary-foreground ${difficultyColor}`}>
            {mission.difficulty}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
