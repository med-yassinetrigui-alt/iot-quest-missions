import { useState } from "react";
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
}

const availableBlocks: CodeBlock[] = [
  { id: "on-start", type: "event", label: "When program starts", icon: "🟢", color: "bg-emerald-600" },
  { id: "on-loop", type: "loop", label: "Repeat forever", icon: "🔄", color: "bg-amber-600" },
  { id: "analog-read", type: "action", label: "Read sensor", icon: "📡", color: "bg-purple-600" },
  { id: "if-greater", type: "condition", label: "If value > 500", icon: "📊", color: "bg-blue-600", params: "500" },
  { id: "if-less", type: "condition", label: "If value < 200", icon: "📉", color: "bg-blue-600", params: "200" },
  { id: "digital-high", type: "action", label: "Set pin HIGH", icon: "⬆️", color: "bg-purple-600" },
  { id: "digital-low", type: "action", label: "Set pin LOW", icon: "⬇️", color: "bg-purple-600" },
  { id: "serial-print", type: "action", label: "Print to serial", icon: "🖨️", color: "bg-purple-600" },
  { id: "wait-1s", type: "wait", label: "Wait 1 second", icon: "⏱️", color: "bg-orange-600" },
  { id: "wait-500ms", type: "wait", label: "Wait 500ms", icon: "⏱️", color: "bg-orange-600" },
];

interface DragDropCodeEditorProps {
  connections: PinConnection[];
  board: "arduino" | "esp32" | "raspberry";
}

export default function DragDropCodeEditor({ connections, board }: DragDropCodeEditorProps) {
  const [placedBlocks, setPlacedBlocks] = useState<PlacedCodeBlock[]>([]);

  const addBlock = (block: CodeBlock) => {
    setPlacedBlocks((prev) => [
      ...prev,
      { ...block, instanceId: `${block.id}-${Date.now()}` },
    ]);
  };

  const removeBlock = (instanceId: string) => {
    setPlacedBlocks((prev) => prev.filter((b) => b.instanceId !== instanceId));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    setPlacedBlocks((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const clearAll = () => setPlacedBlocks([]);

  // Get actual pin numbers from connections
  const sensorConns = connections.filter((c) => c.type === "sensor");
  const actuatorConns = connections.filter((c) => c.type === "actuator");

  const getPinNumber = (pinId: string): string => {
    const num = pinId.replace(/\D/g, "");
    return num || "0";
  };

  const generateCode = (): string => {
    const isArduino = board !== "raspberry";
    const lines: string[] = [];

    if (isArduino) {
      lines.push("// === Auto-generated Arduino Code ===");
      lines.push("");

      // Declare pin variables from actual connections
      sensorConns.forEach((c) => {
        const varName = c.componentName.replace(/\s+/g, "");
        const pin = c.pinId.startsWith("A") ? c.pinId : getPinNumber(c.pinId);
        lines.push(`const int ${varName}Pin = ${pin};`);
      });
      actuatorConns.forEach((c) => {
        const varName = c.componentName.replace(/\s+/g, "");
        lines.push(`const int ${varName}Pin = ${getPinNumber(c.pinId)};`);
      });

      // Declare sensor value variables
      if (sensorConns.length > 0) {
        lines.push("");
        sensorConns.forEach((c) => {
          const varName = c.componentName.replace(/\s+/g, "");
          lines.push(`int ${varName}Value = 0;`);
        });
      }

      lines.push("");
      lines.push("void setup() {");
      lines.push("  Serial.begin(9600);");

      // Set pin modes from connections
      sensorConns.forEach((c) => {
        const varName = c.componentName.replace(/\s+/g, "");
        if (c.pinId.startsWith("A")) {
          lines.push(`  // ${c.componentIcon} ${c.componentName} on ${c.pinId} (analog input)`);
        } else {
          lines.push(`  pinMode(${varName}Pin, INPUT);  // ${c.componentIcon} ${c.componentName}`);
        }
      });
      actuatorConns.forEach((c) => {
        const varName = c.componentName.replace(/\s+/g, "");
        lines.push(`  pinMode(${varName}Pin, OUTPUT); // ${c.componentIcon} ${c.componentName}`);
      });

      lines.push("}");
      lines.push("");
      lines.push("void loop() {");

      // Generate code from placed blocks using actual connections
      const firstSensor = sensorConns[0];
      const firstActuator = actuatorConns[0];
      const sensorVar = firstSensor ? firstSensor.componentName.replace(/\s+/g, "") : "sensor";
      const sensorPin = firstSensor ? (firstSensor.pinId.startsWith("A") ? firstSensor.pinId : `${sensorVar}Pin`) : "A0";
      const actuatorVar = firstActuator ? firstActuator.componentName.replace(/\s+/g, "") : "actuator";

      let indent = "  ";
      placedBlocks.forEach((block) => {
        switch (block.id) {
          case "analog-read":
            lines.push(`${indent}${sensorVar}Value = analogRead(${sensorPin});`);
            break;
          case "if-greater":
            lines.push(`${indent}if (${sensorVar}Value > ${block.params || 500}) {`);
            indent = "    ";
            break;
          case "if-less":
            lines.push(`${indent}if (${sensorVar}Value < ${block.params || 200}) {`);
            indent = "    ";
            break;
          case "digital-high":
            lines.push(`${indent}digitalWrite(${actuatorVar}Pin, HIGH);`);
            break;
          case "digital-low":
            lines.push(`${indent}digitalWrite(${actuatorVar}Pin, LOW);`);
            break;
          case "serial-print":
            lines.push(`${indent}Serial.print("${sensorVar}: ");`);
            lines.push(`${indent}Serial.println(${sensorVar}Value);`);
            break;
          case "wait-1s":
            lines.push(`${indent}delay(1000);`);
            break;
          case "wait-500ms":
            lines.push(`${indent}delay(500);`);
            break;
          default:
            break;
        }
      });

      // Close any open if-blocks
      if (indent === "    ") {
        lines.push("  }");
      }

      if (placedBlocks.length === 0) {
        lines.push("  // Drop code blocks above to program!");
      }

      lines.push("}");
    } else {
      // Python for Raspberry Pi
      lines.push("# === Auto-generated Python Code ===");
      lines.push("import RPi.GPIO as GPIO");
      lines.push("import time");
      lines.push("");
      lines.push("GPIO.setmode(GPIO.BCM)");
      lines.push("");

      sensorConns.forEach((c) => {
        const pin = getPinNumber(c.pinId);
        const varName = c.componentName.replace(/\s+/g, "").toLowerCase();
        lines.push(`${varName}_pin = ${pin}  # ${c.componentIcon} ${c.componentName}`);
        lines.push(`GPIO.setup(${varName}_pin, GPIO.IN)`);
      });
      actuatorConns.forEach((c) => {
        const pin = getPinNumber(c.pinId);
        const varName = c.componentName.replace(/\s+/g, "").toLowerCase();
        lines.push(`${varName}_pin = ${pin}  # ${c.componentIcon} ${c.componentName}`);
        lines.push(`GPIO.setup(${varName}_pin, GPIO.OUT)`);
      });

      lines.push("");
      lines.push("try:");
      lines.push("    while True:");

      const firstSensor = sensorConns[0];
      const firstActuator = actuatorConns[0];
      const pyVar = firstSensor ? firstSensor.componentName.replace(/\s+/g, "").toLowerCase() : "sensor";
      const pyPin = firstSensor ? `${pyVar}_pin` : "17";
      const pyActVar = firstActuator ? firstActuator.componentName.replace(/\s+/g, "").toLowerCase() : "actuator";

      let pyIndent = "        ";
      placedBlocks.forEach((block) => {
        switch (block.id) {
          case "analog-read":
            lines.push(`${pyIndent}${pyVar}_value = GPIO.input(${pyPin})`);
            break;
          case "if-greater":
            lines.push(`${pyIndent}if ${pyVar}_value > ${block.params || 500}:`);
            pyIndent = "            ";
            break;
          case "if-less":
            lines.push(`${pyIndent}if ${pyVar}_value < ${block.params || 200}:`);
            pyIndent = "            ";
            break;
          case "digital-high":
            lines.push(`${pyIndent}GPIO.output(${pyActVar}_pin, GPIO.HIGH)`);
            break;
          case "digital-low":
            lines.push(`${pyIndent}GPIO.output(${pyActVar}_pin, GPIO.LOW)`);
            break;
          case "serial-print":
            lines.push(`${pyIndent}print(f"${pyVar}: {${pyVar}_value}")`);
            break;
          case "wait-1s":
            lines.push(`${pyIndent}time.sleep(1)`);
            break;
          case "wait-500ms":
            lines.push(`${pyIndent}time.sleep(0.5)`);
            break;
          default:
            break;
        }
      });

      if (placedBlocks.length === 0) {
        lines.push("        pass  # Add code blocks above!");
      }

      lines.push("");
      lines.push("except KeyboardInterrupt:");
      lines.push("    GPIO.cleanup()");
    }

    return lines.join("\n");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">🧩 Code Blocks</h3>
        <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
          {board === "raspberry" ? "Python" : "Arduino C++"}
        </span>
      </div>

      {/* Click-to-add block palette */}
      <div className="bg-muted/50 rounded-xl p-3 border border-border">
        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">
          👆 Click a block to add it ↓
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {availableBlocks.map((block) => (
            <button
              key={block.id}
              onClick={() => addBlock(block)}
              className={`${block.color} text-white rounded-lg px-3 py-2 text-xs font-display font-bold flex items-center gap-2 shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all text-left`}
            >
              <span>{block.icon}</span>
              <span>{block.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Workspace */}
      <div className="rounded-xl border-2 border-dashed min-h-[120px] p-3 border-border bg-card/50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            📋 Workspace ({placedBlocks.length} blocks)
          </p>
          {placedBlocks.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[10px] font-bold text-destructive hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {placedBlocks.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-muted-foreground">
            <p className="text-xs font-body text-center">
              Click blocks above to build<br />your program! 🧩
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence>
              {placedBlocks.map((block, index) => (
                <motion.div
                  key={block.instanceId}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 30, opacity: 0 }}
                  className={`${block.color} text-white rounded-lg px-3 py-2 text-xs font-display font-bold flex items-center gap-2 shadow-md relative group`}
                >
                  <span className="text-[10px] text-white/50 font-mono w-4">{index + 1}</span>
                  <span>{block.icon}</span>
                  <span className="flex-1">{block.label}</span>

                  {/* Reorder buttons */}
                  <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                    <button
                      onClick={() => moveBlock(index, "up")}
                      disabled={index === 0}
                      className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] hover:bg-white/40 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveBlock(index, "down")}
                      disabled={index === placedBlocks.length - 1}
                      className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] hover:bg-white/40 disabled:opacity-30"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => removeBlock(block.instanceId)}
                      className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] hover:bg-red-400/60"
                    >
                      ✕
                    </button>
                  </div>

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
  );
}
