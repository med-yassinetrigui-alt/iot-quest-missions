import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { GameState } from "@/types/game";
import { badges } from "@/data/gameData";

interface TopBarProps {
  gameState: GameState;
  onBadgesClick: () => void;
}

export default function TopBar({ gameState, onBadgesClick }: TopBarProps) {
  const navigate = useNavigate();
  const xpToNext = 300 - (gameState.totalXP % 300);
  const xpProgress = ((gameState.totalXP % 300) / 300) * 100;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3"
      style={{ background: "linear-gradient(180deg, hsl(230 30% 20% / 0.85) 0%, transparent 100%)" }}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🌐</span>
        <h1 className="font-display text-2xl font-extrabold text-primary-foreground tracking-wide">
          IoT Quest
        </h1>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        {/* Dashboard button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-primary-foreground hover:scale-105 transition-transform bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/30"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="font-display font-bold text-sm">Dashboard</span>
        </button>

        {/* Level */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-display font-extrabold text-accent-foreground text-lg">
            {gameState.level}
          </div>
          <div className="text-primary-foreground">
            <p className="text-xs font-body font-bold opacity-80">LEVEL</p>
            <div className="w-24 h-2 rounded-full bg-card/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 text-primary-foreground">
          <span className="text-xl">⭐</span>
          <span className="font-display font-extrabold text-lg">{gameState.totalXP} XP</span>
        </div>

        {/* Badges */}
        <button
          onClick={onBadgesClick}
          className="flex items-center gap-2 text-primary-foreground hover:scale-105 transition-transform"
        >
          <span className="text-xl">🏆</span>
          <span className="font-display font-bold">{gameState.earnedBadges.length}/{badges.length}</span>
        </button>

        {/* Missions completed */}
        <div className="flex items-center gap-2 text-primary-foreground">
          <span className="text-xl">📋</span>
          <span className="font-display font-bold">{gameState.completedMissions.length} done</span>
        </div>
      </div>
    </motion.div>
  );
}
