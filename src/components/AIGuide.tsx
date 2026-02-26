import { motion } from "framer-motion";

const guideMessages = [
  "Hey there! 👋 Click on a mission marker to start solving city problems!",
  "Each mission teaches you a new IoT concept. Start with the easy ones!",
  "Drag sensors and actuators to build your IoT solution! 🔧",
  "Use IF→THEN blocks to create smart rules! 🧠",
];

interface AIGuideProps {
  message?: string;
}

export default function AIGuide({ message }: AIGuideProps) {
  const displayMsg = message || guideMessages[0];

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-50 flex items-end gap-3 max-w-sm"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
    >
      {/* Robot character */}
      <motion.div
        className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl border-4 border-card shadow-lg"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        🤖
      </motion.div>

      {/* Speech bubble */}
      <div className="game-card relative p-4 text-sm font-body font-semibold text-card-foreground">
        <div className="absolute -left-2 bottom-4 w-4 h-4 bg-card border-l-4 border-b-4 border-border rotate-45" />
        <p>{displayMsg}</p>
      </div>
    </motion.div>
  );
}
