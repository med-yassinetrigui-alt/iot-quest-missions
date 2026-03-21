import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mission, PlacedBlock, IoTBlock } from "@/types/game";
import { iotBlocks } from "@/data/gameData";
import HardwareBoard from "@/components/lab/HardwareBoard";
import CodeBlocks from "@/components/lab/CodeBlocks";

interface MissionModalProps {
  mission: Mission;
  onClose: () => void;
  onComplete: (missionId: string, xp: number) => void;
}

export default function MissionModal({ mission, onClose, onComplete }: MissionModalProps) {
  const [step, setStep] = useState<"intro" | "lab" | "success">("intro");
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [selectedBoard, setSelectedBoard] = useState<"arduino" | "esp32" | "raspberry">("arduino");
  const [labTab, setLabTab] = useState<"build" | "code">("build");
  const [guideMsg, setGuideMsg] = useState("Let's solve this problem together! Start by reading the mission briefing. 📖");

  const difficultyStyles = {
    easy: { bg: "bg-secondary", label: "Easy", stars: "⭐" },
    medium: { bg: "bg-accent", label: "Medium", stars: "⭐⭐" },
    hard: { bg: "bg-destructive", label: "Hard", stars: "⭐⭐⭐" },
  }[mission.difficulty];

  const addBlock = (block: IoTBlock, zone: PlacedBlock["zone"]) => {
    setPlacedBlocks((prev) => [...prev, { block, zone }]);
    setGuideMsg(`Great choice! ${block.icon} ${block.name} connected to ${selectedBoard === "arduino" ? "Arduino" : selectedBoard === "esp32" ? "ESP32" : "Raspberry Pi"}! 🔧`);
  };

  const removeBlock = (index: number) => {
    setPlacedBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const hasSensor = placedBlocks.some((b) => b.zone === "sensor");
    const hasController = placedBlocks.some((b) => b.zone === "controller");
    const hasActuator = placedBlocks.some((b) => b.zone === "actuator");

    if (hasSensor && hasController && hasActuator) {
      setStep("success");
      setGuideMsg("🎉 AMAZING! You solved it! The city is safer thanks to you!");
    } else {
      setGuideMsg("Hmm, you need at least one sensor, one controller (IF→THEN), and one actuator. Try again! 💪");
    }
  };

  const handleCelebrate = () => {
    onComplete(mission.id, mission.xp);
    onClose();
  };

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
          className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto game-card border-primary"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg hover:bg-destructive hover:text-destructive-foreground transition-colors z-10"
          >
            ✕
          </button>

          {step === "intro" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-3xl">
                  {mission.icon}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-foreground">{mission.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`${difficultyStyles.bg} px-3 py-1 rounded-full text-xs font-bold text-primary-foreground`}>
                      {difficultyStyles.label}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">{difficultyStyles.stars} {mission.xp} XP</span>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">{mission.category}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-2xl p-5">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">📋 Mission Briefing</h3>
                <p className="font-body text-foreground/80 leading-relaxed">{mission.description}</p>
              </div>

              <div className="flex items-start gap-3 bg-primary/10 rounded-2xl p-4">
                <span className="text-3xl">🤖</span>
                <p className="font-body font-semibold text-foreground text-sm">{guideMsg}</p>
              </div>

              <button
                className="game-btn-primary w-full text-xl"
                onClick={() => {
                  setStep("lab");
                  setGuideMsg("Pick your board, connect sensors & actuators, then check the code! 🛠️");
                }}
              >
                🚀 Start Lab
              </button>
            </div>
          )}

          {step === "lab" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-extrabold text-foreground">
                {mission.icon} {mission.title} — Lab
              </h2>

              {/* Guide */}
              <div className="flex items-start gap-3 bg-primary/10 rounded-2xl p-3">
                <span className="text-2xl">🤖</span>
                <p className="font-body font-semibold text-foreground text-sm">{guideMsg}</p>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-2">
                <button
                  onClick={() => setLabTab("build")}
                  className={`flex-1 py-2 rounded-xl font-display font-bold text-sm transition-all ${
                    labTab === "build" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  🔧 Build & Connect
                </button>
                <button
                  onClick={() => setLabTab("code")}
                  className={`flex-1 py-2 rounded-xl font-display font-bold text-sm transition-all ${
                    labTab === "code" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  📝 View Code
                </button>
              </div>

              {labTab === "build" && (
                <div className="space-y-4">
                  {/* Hardware Board */}
                  <HardwareBoard
                    board={selectedBoard}
                    connectedBlocks={placedBlocks}
                    onSelectBoard={setSelectedBoard}
                  />

                  {/* Toolbox */}
                  <div className="grid grid-cols-3 gap-3">
                    <ToolboxSection title="📡 Sensors" blocks={iotBlocks.sensors} zone="sensor" onAdd={addBlock} />
                    <ToolboxSection title="🧠 Controllers" blocks={iotBlocks.controllers} zone="controller" onAdd={addBlock} />
                    <ToolboxSection title="⚡ Actuators" blocks={iotBlocks.actuators} zone="actuator" onAdd={addBlock} />
                  </div>

                  {/* Connected components */}
                  <div className="bg-muted rounded-2xl p-4">
                    <h3 className="font-display text-lg font-bold text-foreground mb-3">🔗 Connected Components</h3>
                    {placedBlocks.length === 0 ? (
                      <p className="text-muted-foreground font-body text-center py-6">
                        Click blocks above to connect them to your {selectedBoard === "arduino" ? "Arduino" : selectedBoard === "esp32" ? "ESP32" : "Raspberry Pi"}!
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {placedBlocks.map((pb, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 bg-card rounded-xl px-3 py-2 border-2 border-border cursor-pointer hover:border-destructive transition-colors"
                            onClick={() => removeBlock(i)}
                          >
                            <span>{pb.block.icon}</span>
                            <span className="font-body font-bold text-sm text-foreground">{pb.block.name}</span>
                            <span className="text-xs text-muted-foreground">✕</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* IF → THEN visual */}
                  {placedBlocks.some((b) => b.zone === "controller") && (
                    <div className="bg-game-purple/10 rounded-2xl p-4 border-2 border-game-purple/30">
                      <h3 className="font-display text-lg font-bold text-foreground mb-2">🔀 Logic Rule</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-primary text-primary-foreground font-display font-bold px-4 py-2 rounded-xl">IF</span>
                        {placedBlocks.filter((b) => b.zone === "sensor").map((b, i) => (
                          <span key={i} className="bg-card border-2 border-border rounded-xl px-3 py-2 font-body font-bold text-sm">
                            {b.block.icon} {b.block.name} detects
                          </span>
                        ))}
                        <span className="bg-accent text-accent-foreground font-display font-bold px-4 py-2 rounded-xl">THEN</span>
                        {placedBlocks.filter((b) => b.zone === "actuator").map((b, i) => (
                          <span key={i} className="bg-card border-2 border-border rounded-xl px-3 py-2 font-body font-bold text-sm">
                            {b.block.icon} Activate {b.block.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {labTab === "code" && (
                <div className="space-y-4">
                  <HardwareBoard
                    board={selectedBoard}
                    connectedBlocks={placedBlocks}
                    onSelectBoard={setSelectedBoard}
                  />
                  <CodeBlocks placedBlocks={placedBlocks} board={selectedBoard} />
                </div>
              )}

              {/* Bottom actions */}
              <div className="flex items-center gap-3">
                <button
                  className="game-btn-accent text-sm"
                  onClick={() => {
                    setShowHint(true);
                    setGuideMsg(mission.hints[currentHint] || "You've seen all the hints! You can do it! 💪");
                    setCurrentHint((prev) => Math.min(prev + 1, mission.hints.length - 1));
                  }}
                >
                  💡 Hint ({currentHint}/{mission.hints.length})
                </button>
                <button className="game-btn-primary flex-1 text-lg" onClick={handleSubmit}>
                  ✅ Submit Solution
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <motion.div className="text-center space-y-6 py-6" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <motion.div className="text-7xl" animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                🎉
              </motion.div>
              <h2 className="font-display text-3xl font-extrabold text-foreground">Mission Complete!</h2>
              <p className="font-body text-lg text-muted-foreground">
                You earned <span className="font-bold text-accent">{mission.xp} XP</span> and helped the city!
              </p>
              <div className="flex items-start gap-3 bg-secondary/20 rounded-2xl p-4 text-left mx-auto max-w-md">
                <span className="text-3xl">🤖</span>
                <p className="font-body font-semibold text-foreground text-sm">{guideMsg}</p>
              </div>
              <button className="game-btn-secondary text-xl" onClick={handleCelebrate}>
                🏆 Collect Reward
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ToolboxSection({
  title,
  blocks,
  zone,
  onAdd,
}: {
  title: string;
  blocks: IoTBlock[];
  zone: PlacedBlock["zone"];
  onAdd: (block: IoTBlock, zone: PlacedBlock["zone"]) => void;
}) {
  return (
    <div className="bg-card/50 rounded-2xl p-3 border-2 border-border">
      <h4 className="font-display text-sm font-bold text-foreground mb-2">{title}</h4>
      <div className="space-y-1">
        {blocks.map((block) => (
          <button
            key={block.id}
            onClick={() => onAdd(block, zone)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <span className="text-lg">{block.icon}</span>
            <span className="font-body font-semibold text-xs text-foreground">{block.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
