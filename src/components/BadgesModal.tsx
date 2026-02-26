import { motion, AnimatePresence } from "framer-motion";
import { badges as allBadges } from "@/data/gameData";
import { GameState } from "@/types/game";

interface BadgesModalProps {
  gameState: GameState;
  onClose: () => void;
}

export default function BadgesModal({ gameState, onClose }: BadgesModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative w-full max-w-lg game-card"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            ✕
          </button>

          <h2 className="font-display text-2xl font-extrabold text-foreground mb-6">🏆 Your Badges</h2>

          <div className="grid grid-cols-3 gap-4">
            {allBadges.map((badge, i) => {
              const earned = gameState.earnedBadges.includes(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  className={`text-center p-4 rounded-2xl border-4 transition-all ${
                    earned ? "border-accent bg-accent/10" : "border-border bg-muted/50 opacity-50"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className={`text-4xl mb-2 ${earned ? "" : "grayscale"}`}>{badge.icon}</div>
                  <p className="font-display font-bold text-sm text-foreground">{badge.name}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{badge.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <p className="font-body font-bold text-muted-foreground">
              {gameState.earnedBadges.length} / {allBadges.length} badges earned
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
