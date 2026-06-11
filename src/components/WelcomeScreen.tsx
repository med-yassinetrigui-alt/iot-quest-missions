import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
  onStart: () => void;
}

const STORY = [
  {
    title: "Hey there, future engineer! 👋",
    text: "I'm BIT — your IoT teen engineer buddy. I live inside the circuits of this smart city and I've been waiting for someone special… you!",
  },
  {
    title: "Our city needs a hero 🌆",
    text: "Lately, lights stay off at night, parking gates are stuck, gardens are dying of thirst, and bridges shake without warning. The citizens are scared!",
  },
  {
    title: "That hero is YOU 🦸",
    text: "You'll travel from lab to lab, wire up sensors and actuators on a real Arduino Uno, and write the smart logic that brings every system back to life.",
  },
  {
    title: "I'll be right beside you 🤖",
    text: "In every lab I'll explain HOW to wire it, WHAT code to build, and WHY it works that way. Earn XP, unlock badges, and become the city's #1 IoT hero!",
  },
];

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STORY.length - 1;
  const current = STORY[step];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-accent/80 to-secondary/90 backdrop-blur-md" />

      <motion.div
        className="relative w-full max-w-2xl game-card border-4 border-primary p-6 sm:p-8"
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220 }}
      >
        <div className="flex flex-col items-center text-center gap-5">
          {/* Robot hero */}
          <motion.div
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-7xl border-4 border-card shadow-2xl"
            animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🤖
            <motion.span
              className="absolute -top-2 -right-2 text-3xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </motion.div>

          {/* Speech */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 min-h-[140px]"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                {current.title}
              </h2>
              <p className="font-body text-base sm:text-lg text-foreground/80 leading-relaxed max-w-lg mx-auto">
                {current.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex gap-2">
            {STORY.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === step ? "w-8 bg-primary" : "w-2.5 bg-muted hover:bg-muted-foreground/40"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full max-w-sm">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-xl font-display font-bold text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                ← Back
              </button>
            )}
            {!isLast ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="game-btn-primary flex-1"
              >
                Next →
              </button>
            ) : (
              <motion.button
                onClick={onStart}
                className="game-btn-primary flex-1 text-lg"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                🚀 Let's save the city!
              </motion.button>
            )}
          </div>

          {step === 0 && (
            <button
              onClick={onStart}
              className="text-xs font-body text-muted-foreground hover:text-foreground underline"
            >
              Skip intro
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
