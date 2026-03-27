import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { PinConnection } from "./ArduinoBoard";

interface CodeBlock {
  id: string;
  type: "event" | "condition" | "action" | "loop" | "variable" | "wait";
  label: string;
  icon: string;
  color: string;
  params?: string;
}

interface PlacedCodeBlock extends CodeBlock {
  instanceId: string;
  children?: PlacedCodeBlock[];
}

const availableBlocks: CodeBlock[] = [
  // Events
  { id: "on-start", type: "event", label: "When program starts", icon: "🟢", color: "bg-emerald-600" },
  { id: "on-loop", type: "loop", label: "Repeat forever", icon: "🔄", color: "bg-amber-600" },
  { id: "on-pin", type: "event", label: "When pin reads", icon: "📌", color: "bg-emerald-600" },

  // Conditions
  { id: "if-then", type: "condition", label: "If ... then", icon: "🔀", color: "bg-blue-600" },
  { id: "if-greater", type: "condition", label: "If value > 500", icon: "📊", color: "bg-blue-600", params: "500" },
  { id: "if-less", type: "condition", label: "If value < 200", icon: "📉", color: "bg-blue-600", params: "200" },

  // Actions
  { id: "digital-high", type: "action", label: "Set pin HIGH", icon: "⬆️", color: "bg-purple-600" },
  { id: "digital-low", type: "action", label: "Set pin LOW", icon: "⬇️", color: "bg-purple-600" },
  { id: "analog-read", type: "action", label: "Read sensor", icon: "📡", color: "bg-purple-600" },
  { id: "serial-print", type: "action", label: "Print to serial", icon: "🖨️", color: "bg-purple-600" },

  // Utilities
  { id: "wait-1s", type: "wait", label: "Wait 1 second", icon: "⏱️", color: "bg-orange-600" },
  { id: "wait-500ms", type: "wait", label: "Wait 500ms", icon: "⏱️", color: "bg-orange-600" },
  { id: "set-var", type: "variable", label: "Set variable =", icon: "📦", color: "bg-teal-600" },
];

function DraggableCodeBlock({ block }: { block: CodeBlock }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `code-${block.id}`,
    data: { codeBlock: block },
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`${block.color} text-white rounded-lg px-3 py-2 text-xs font-display font-bold cursor-grab active:cursor-grabbing flex items-center gap-2 shadow-md hover:shadow-lg hover:brightness-110 transition-all select-none`}
    >
      <span>{block.icon}</span>
      <span>{block.label}</span>
    </div>
  );
}

interface DragDropCodeEditorProps {
  connections: PinConnection[];
  board: "arduino" | "esp32" | "raspberry";
}

export default function DragDropCodeEditor({ connections, board }: DragDropCodeEditorProps) {
  const [placedBlocks, setPlacedBlocks] = useState<PlacedCodeBlock[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<CodeBlock | null>(null);

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: "code-workspace" });

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.codeBlock) {
      setDraggedBlock(data.codeBlock);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedBlock(null);
    const { active, over } = event;
    if (!over || over.id !== "code-workspace") return;

    const data = active.data.current;
    if (data?.codeBlock) {
      const block = data.codeBlock as CodeBlock;
      setPlacedBlocks((prev) => [
        ...prev,
        { ...block, instanceId: `${block.id}-${Date.now()}` },
      ]);
    }
  };

  const removeBlock = (instanceId: string) => {
    setPlacedBlocks((prev) => prev.filter((b) => b.instanceId !== instanceId));
  };

  const generateCode = (): string => {
    const isArduino = board !== "raspberry";
    const lines: string[] = [];

    if (isArduino) {
      // Generate Arduino code from connections
      connections.forEach((c) => {
        if (c.type === "sensor") {
          lines.push(`int ${c.componentName.replace(/\s/g, "")}Pin = ${c.pinId.replace(/\D/g, "") || "A0"};`);
        } else {
          lines.push(`int ${c.componentName.replace(/\s/g, "")}Pin = ${c.pinId.replace(/\D/g, "") || "13"};`);
        }
      });

      lines.push("");
      lines.push("void setup() {");
      lines.push("  Serial.begin(9600);");
      connections.forEach((c) => {
        if (c.type === "actuator") {
          lines.push(`  pinMode(${c.componentName.replace(/\s/g, "")}Pin, OUTPUT);`);
        }
      });
      lines.push("}");
      lines.push("");
      lines.push("void loop() {");

      placedBlocks.forEach((block) => {
        switch (block.type) {
          case "action":
            if (block.id === "analog-read") lines.push("  int sensorValue = analogRead(A0);");
            else if (block.id === "digital-high") lines.push("  digitalWrite(13, HIGH);");
            else if (block.id === "digital-low") lines.push("  digitalWrite(13, LOW);");
            else if (block.id === "serial-print") lines.push('  Serial.println(sensorValue);');
            break;
          case "condition":
            if (block.id === "if-greater") lines.push(`  if (sensorValue > ${block.params || 500}) {`);
            else if (block.id === "if-less") lines.push(`  if (sensorValue < ${block.params || 200}) {`);
            else lines.push("  if (condition) {");
            break;
          case "wait":
            if (block.id === "wait-1s") lines.push("  delay(1000);");
            else lines.push("  delay(500);");
            break;
          case "variable":
            lines.push("  int value = 0;");
            break;
          default:
            break;
        }
      });

      lines.push("}");
    } else {
      // Python for Raspberry Pi
      lines.push("import RPi.GPIO as GPIO");
      lines.push("import time");
      lines.push("");
      lines.push("GPIO.setmode(GPIO.BCM)");

      connections.forEach((c) => {
        const pin = c.pinId.replace(/\D/g, "") || "17";
        if (c.type === "sensor") {
          lines.push(`# ${c.componentIcon} ${c.componentName}`);
          lines.push(`GPIO.setup(${pin}, GPIO.IN)`);
        } else {
          lines.push(`# ${c.componentIcon} ${c.componentName}`);
          lines.push(`GPIO.setup(${pin}, GPIO.OUT)`);
        }
      });

      lines.push("");
      lines.push("while True:");

      placedBlocks.forEach((block) => {
        switch (block.type) {
          case "action":
            if (block.id === "analog-read") lines.push("    value = GPIO.input(17)");
            else if (block.id === "digital-high") lines.push("    GPIO.output(18, GPIO.HIGH)");
            else if (block.id === "digital-low") lines.push("    GPIO.output(18, GPIO.LOW)");
            else if (block.id === "serial-print") lines.push("    print(f'Value: {value}')");
            break;
          case "condition":
            if (block.id === "if-greater") lines.push(`    if value > ${block.params || 500}:`);
            else if (block.id === "if-less") lines.push(`    if value < ${block.params || 200}:`);
            else lines.push("    if condition:");
            break;
          case "wait":
            if (block.id === "wait-1s") lines.push("    time.sleep(1)");
            else lines.push("    time.sleep(0.5)");
            break;
          default:
            break;
        }
      });

      if (placedBlocks.length === 0) {
        lines.push("    pass  # Add code blocks here!");
      }
    }

    return lines.join("\n");
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-foreground">🧩 Code Blocks</h3>
          <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
            {board === "raspberry" ? "Python" : "Arduino C++"}
          </span>
        </div>

        {/* Available blocks palette */}
        <div className="bg-muted/50 rounded-xl p-3 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">
            Drag blocks to workspace ↓
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {availableBlocks.map((block) => (
              <DraggableCodeBlock key={block.id} block={block} />
            ))}
          </div>
        </div>

        {/* Workspace */}
        <div
          ref={setDropRef}
          className={`rounded-xl border-2 border-dashed min-h-[160px] p-3 transition-all ${
            isOver
              ? "border-primary bg-primary/10 shadow-[inset_0_0_20px_hsl(var(--primary)/0.1)]"
              : "border-border bg-card/50"
          }`}
        >
          <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">
            📋 Workspace
          </p>

          {placedBlocks.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              <p className="text-xs font-body text-center">
                Drop code blocks here to build<br />your program! 🧩
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <AnimatePresence>
                {placedBlocks.map((block, index) => (
                  <motion.div
                    key={block.instanceId}
                    initial={{ x: -30, opacity: 0, height: 0 }}
                    animate={{ x: 0, opacity: 1, height: "auto" }}
                    exit={{ x: 30, opacity: 0, height: 0 }}
                    className={`${block.color} text-white rounded-lg px-3 py-2 text-xs font-display font-bold flex items-center gap-2 shadow-md relative group`}
                  >
                    <span className="text-[10px] text-white/50 font-mono w-4">{index + 1}</span>
                    <span>{block.icon}</span>
                    <span className="flex-1">{block.label}</span>
                    <button
                      onClick={() => removeBlock(block.instanceId)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] hover:bg-white/40"
                    >
                      ✕
                    </button>
                    {/* Connector notch */}
                    {index < placedBlocks.length - 1 && (
                      <div className="absolute -bottom-1 left-6 w-4 h-2 rounded-b bg-inherit z-10" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Generated code preview */}
        {(placedBlocks.length > 0 || connections.length > 0) && (
          <div className="rounded-xl bg-zinc-900 p-3 overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Generated Code
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(generateCode())}
                className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-800 px-2 py-1 rounded"
              >
                📋 Copy
              </button>
            </div>
            <pre className="text-[11px] font-mono text-green-400 leading-relaxed whitespace-pre">
              {generateCode()}
            </pre>
          </div>
        )}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {draggedBlock && (
          <div className={`${draggedBlock.color} text-white rounded-lg px-3 py-2 text-xs font-display font-bold flex items-center gap-2 shadow-2xl rotate-3`}>
            <span>{draggedBlock.icon}</span>
            <span>{draggedBlock.label}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
