import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PinConnection } from "./ArduinoBoard";

interface CodeBlock {
  id: string;
  type: "event" | "condition" | "action" | "loop" | "wait";
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
  { id: "if-greater", type: "condition", label: "If value > value_of_sensor", icon: "📊", color: "bg-blue-600", params: "value_of_sensor" },
  { id: "if-less", type: "condition", label: "If value < value_of_sensor", icon: "📉", color: "bg-blue-600", params: "value_of_sensor" },
  { id: "digital-high", type: "action", label: "Set pin HIGH", icon: "⬆️", color: "bg-purple-600" },
  { id: "digital-low", type: "action", label: "Set pin LOW", icon: "⬇️", color: "bg-purple-600" },
  { id: "serial-print", type: "action", label: "Print to serial", icon: "🖨️", color: "bg-purple-600" },
  { id: "wait-1s", type: "wait", label: "Wait 1 second", icon: "⏱️", color: "bg-orange-600" },
  { id: "wait-500ms", type: "wait", label: "Wait 500ms", icon: "⏱️", color: "bg-orange-600" },
];

interface DragDropCodeEditorProps {
  connections: PinConnection[];
  onValidationChange?: (isValid: boolean) => void;
}

export default function DragDropCodeEditor({ connections, onValidationChange }: DragDropCodeEditorProps) {
  const [placedBlocks, setPlacedBlocks] = useState<PlacedCodeBlock[]>([]);

  const sensorConns = connections.filter((c) => c.type === "sensor");
  const actuatorConns = connections.filter((c) => c.type === "actuator");

  // Validate code logic
  const validateCode = (blocks: PlacedCodeBlock[]): string[] => {
    const errors: string[] = [];
    if (blocks.length === 0) {
      errors.push("Add code blocks to build your program");
      return errors;
    }
    const hasRead = blocks.some((b) => b.id === "analog-read");
    const hasCondition = blocks.some((b) => b.type === "condition");
    const hasOutput = blocks.some((b) => b.id === "digital-high" || b.id === "digital-low");

    if (sensorConns.length > 0 && !hasRead) errors.push("📡 Read your sensor data with 'Read sensor' block");
    if (hasRead && !hasCondition) errors.push("📊 Add a condition (If value > / <) to make decisions");
    if (actuatorConns.length > 0 && !hasOutput) errors.push("⬆️ Control your actuator with 'Set pin HIGH/LOW'");
    if (!hasRead && hasCondition) errors.push("📡 Read sensor first before checking conditions");

    // Check ordering: read should come before condition, condition before output
    const readIdx = blocks.findIndex((b) => b.id === "analog-read");
    const condIdx = blocks.findIndex((b) => b.type === "condition");
    const outIdx = blocks.findIndex((b) => b.id === "digital-high" || b.id === "digital-low");
    if (readIdx >= 0 && condIdx >= 0 && readIdx > condIdx) errors.push("🔄 Read sensor BEFORE checking conditions");
    if (condIdx >= 0 && outIdx >= 0 && condIdx > outIdx) errors.push("🔄 Check condition BEFORE setting output");

    const isValid = errors.length === 0;
    onValidationChange?.(isValid);
    return errors;
  };

  const codeErrors = validateCode(placedBlocks);

  const addBlock = (block: CodeBlock) => {
    const newBlocks = [...placedBlocks, { ...block, instanceId: `${block.id}-${Date.now()}` }];
    setPlacedBlocks(newBlocks);
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

  const clearAll = () => {
    setPlacedBlocks([]);
    onValidationChange?.(false);
  };

  const getPinNumber = (pinId: string): string => pinId.replace(/\D/g, "") || "0";

  const generateCode = (): string => {
    const lines: string[] = [];
    lines.push("// === Arduino Uno - Auto-generated Code ===");
    lines.push("");

    sensorConns.forEach((c) => {
      const varName = c.componentName.replace(/\s+/g, "");
      const pin = c.pinId.startsWith("A") ? c.pinId : getPinNumber(c.pinId);
      lines.push(`const int ${varName}Pin = ${pin};`);
    });
    actuatorConns.forEach((c) => {
      const varName = c.componentName.replace(/\s+/g, "");
      lines.push(`const int ${varName}Pin = ${getPinNumber(c.pinId)};`);
    });

    if (sensorConns.length > 0) {
      lines.push("");
      sensorConns.forEach((c) => {
        lines.push(`int ${c.componentName.replace(/\s+/g, "")}Value = 0;`);
      });
    }

    lines.push("");
    lines.push("void setup() {");
    lines.push("  Serial.begin(9600);");
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
      }
    });

    if (indent === "    ") lines.push("  }");
    if (placedBlocks.length === 0) lines.push("  // Drop code blocks above to program!");
    lines.push("}");
    return lines.join("\n");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">🧩 Code Blocks</h3>
        <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground">Arduino C++</span>
      </div>

      {/* Validation feedback */}
      {codeErrors.length > 0 && placedBlocks.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-2 space-y-1">
          {codeErrors.map((err, i) => (
            <p key={i} className="text-[11px] font-body font-semibold text-destructive">{err}</p>
          ))}
        </div>
      )}
      {codeErrors.length === 0 && placedBlocks.length > 0 && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-2">
          <p className="text-[11px] font-body font-bold text-secondary">✅ Code logic looks correct!</p>
        </div>
      )}

      {/* Block palette */}
      <div className="bg-muted/50 rounded-xl p-3 border border-border">
        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">👆 Click to add ↓</p>
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
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">📋 Workspace ({placedBlocks.length})</p>
          {placedBlocks.length > 0 && (
            <button onClick={clearAll} className="text-[10px] font-bold text-destructive hover:underline">Clear all</button>
          )}
        </div>

        {placedBlocks.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-muted-foreground">
            <p className="text-xs font-body text-center">Click blocks above to build<br />your program! 🧩</p>
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
                  <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                    <button onClick={() => moveBlock(index, "up")} disabled={index === 0} className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] hover:bg-white/40 disabled:opacity-30">▲</button>
                    <button onClick={() => moveBlock(index, "down")} disabled={index === placedBlocks.length - 1} className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] hover:bg-white/40 disabled:opacity-30">▼</button>
                    <button onClick={() => removeBlock(block.instanceId)} className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] hover:bg-red-400/60">✕</button>
                  </div>
                  {index < placedBlocks.length - 1 && (
                    <div className="absolute -bottom-1 left-6 w-4 h-2 rounded-b bg-inherit z-10" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Generated code */}
      {(placedBlocks.length > 0 || connections.length > 0) && (
        <div className="rounded-xl bg-zinc-900 p-3 overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Generated Arduino Code</span>
            <button onClick={() => navigator.clipboard.writeText(generateCode())} className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-800 px-2 py-1 rounded">📋 Copy</button>
          </div>
          <pre className="text-[11px] font-mono text-green-400 leading-relaxed whitespace-pre">{generateCode()}</pre>
        </div>
      )}
    </div>
  );
}
