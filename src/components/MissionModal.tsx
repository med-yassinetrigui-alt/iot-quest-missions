import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from "@dnd-kit/core";
import { Mission, IoTBlock } from "@/types/game";
import { iotBlocks } from "@/data/gameData";
import ArduinoBoard, { PinConnection } from "@/components/lab/ArduinoBoard";
import ComponentTray from "@/components/lab/ComponentTray";
import DragDropCodeEditor from "@/components/lab/DragDropCodeEditor";

interface MissionModalProps {
  mission: Mission;
  onClose: () => void;
  onComplete: (missionId: string, xp: number) => void;
}

export default function MissionModal({ mission, onClose, onComplete }: MissionModalProps) {
  const [step, setStep] = useState<"intro" | "lab" | "success">("intro");
  const [connections, setConnections] = useState<PinConnection[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<"arduino" | "esp32" | "raspberry">("arduino");
  const [labTab, setLabTab] = useState<"build" | "code">("build");
  const [guideMsg, setGuideMsg] = useState("Let's solve this problem together! Start by reading the mission briefing. 📖");
  const [currentHint, setCurrentHint] = useState(0);
  const [draggedItem, setDraggedItem] = useState<{ block: IoTBlock; type: string } | null>(null);

  const difficultyStyles = {
    easy: { bg: "bg-secondary", label: "Easy", stars: "⭐" },
    medium: { bg: "bg-accent", label: "Medium", stars: "⭐⭐" },
    hard: { bg: "bg-destructive", label: "Hard", stars: "⭐⭐⭐" },
  }[mission.difficulty];

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.block) {
      setDraggedItem({ block: data.block, type: data.type });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedItem(null);
    const { active, over } = event;
    if (!over) return;

    const pinId = over.data.current?.pinId;
    if (!pinId) return;

    const data = active.data.current;
    if (!data?.block) return;

    const block = data.block as IoTBlock;
    const type = data.type as "sensor" | "actuator";

    // Check if pin is already used
    if (connections.find((c) => c.pinId === pinId)) {
      setGuideMsg(`⚠️ Pin ${pinId} is already in use! Try another pin.`);
      return;
    }

    // Validate pin type compatibility
    const pinData = over.data.current;
    const pinType = pinData?.pinType as string | undefined;
    if (pinType && pinType !== "both" && pinType !== type) {
      const isAnalog = pinId.startsWith("A") || pinId.startsWith("GPIO3");
      if (type === "sensor" && !isAnalog) {
        setGuideMsg(`💡 Tip: Sensors work best on analog pins (A0-A5). Try the bottom pins!`);
      } else if (type === "actuator" && isAnalog) {
        setGuideMsg(`💡 Tip: Actuators need digital pins (D4-D13). Try the side pins!`);
      }
    }

    const newConnection: PinConnection = {
      pinId,
      componentId: block.id,
      componentName: block.name,
      componentIcon: block.icon,
      type,
    };

    setConnections((prev) => [...prev, newConnection]);
    setGuideMsg(`✅ ${block.icon} ${block.name} connected to pin ${pinId}! ${type === "sensor" ? "Input ready!" : "Output ready!"} 🔌`);
  };

  const removeConnection = (pinId: string) => {
    const conn = connections.find((c) => c.pinId === pinId);
    setConnections((prev) => prev.filter((c) => c.pinId !== pinId));
    if (conn) setGuideMsg(`Removed ${conn.componentIcon} ${conn.componentName} from pin ${pinId}`);
  };

  const handleSubmit = () => {
    const hasSensor = connections.some((c) => c.type === "sensor");
    const hasActuator = connections.some((c) => c.type === "actuator");

    if (hasSensor && hasActuator) {
      setStep("success");
      setGuideMsg("🎉 AMAZING! You solved it! The city is safer thanks to you!");
    } else {
      setGuideMsg("Hmm, you need at least one sensor and one actuator connected to the board. Try again! 💪");
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
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto game-card border-primary"
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

          {/* INTRO */}
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
                  setGuideMsg("Drag sensors & actuators onto the Arduino pins, then switch to Code tab to program! 🛠️");
                }}
              >
                🚀 Start Lab
              </button>
            </div>
          )}

          {/* LAB */}
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
                  🔧 Build Circuit
                </button>
                <button
                  onClick={() => setLabTab("code")}
                  className={`flex-1 py-2 rounded-xl font-display font-bold text-sm transition-all ${
                    labTab === "code" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  🧩 Program
                </button>
              </div>

              {labTab === "build" && (
                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Board */}
                    <ArduinoBoard
                      board={selectedBoard}
                      connections={connections}
                      onSelectBoard={setSelectedBoard}
                      onRemoveConnection={removeConnection}
                    />

                    {/* Right: Components + connections list */}
                    <div className="space-y-4">
                      <ComponentTray sensors={iotBlocks.sensors} actuators={iotBlocks.actuators} />

                      {/* Connected list */}
                      {connections.length > 0 && (
                        <div className="bg-muted rounded-xl p-3">
                          <h4 className="text-xs font-display font-bold text-foreground mb-2">🔗 Wired Connections</h4>
                          <div className="space-y-1">
                            {connections.map((c) => (
                              <div
                                key={c.pinId}
                                className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border group cursor-pointer hover:border-destructive transition-colors"
                                onClick={() => removeConnection(c.pinId)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold text-muted-foreground">
                                    {c.pinId}
                                  </span>
                                  <span className="text-xs">→</span>
                                  <span>{c.componentIcon}</span>
                                  <span className="text-xs font-display font-bold text-foreground">{c.componentName}</span>
                                </div>
                                <span className="text-xs text-muted-foreground group-hover:text-destructive">✕</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drag overlay */}
                  <DragOverlay>
                    {draggedItem && (
                      <div className="bg-card border-2 border-primary rounded-xl px-3 py-2 shadow-2xl flex items-center gap-2 rotate-3">
                        <span className="text-lg">{draggedItem.block.icon}</span>
                        <span className="text-xs font-display font-bold text-foreground">{draggedItem.block.name}</span>
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              )}

              {labTab === "code" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ArduinoBoard
                    board={selectedBoard}
                    connections={connections}
                    onSelectBoard={setSelectedBoard}
                    onRemoveConnection={removeConnection}
                  />
                  <DragDropCodeEditor connections={connections} board={selectedBoard} />
                </div>
              )}

              {/* Bottom actions */}
              <div className="flex items-center gap-3">
                <button
                  className="game-btn-accent text-sm"
                  onClick={() => {
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

          {/* SUCCESS */}
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
