import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PinConnection } from "./ArduinoBoard";
import { recipeForMission, MissionCodeBlock } from "@/data/missionCodeBlocks";

interface PlacedCodeBlock extends MissionCodeBlock {
  instanceId: string;
}

interface DragDropCodeEditorProps {
  connections: PinConnection[];
  missionId: string;
  onValidationChange?: (isValid: boolean) => void;
}

export default function DragDropCodeEditor({ connections, missionId, onValidationChange }: DragDropCodeEditorProps) {
  const recipe = useMemo(() => recipeForMission(missionId), [missionId]);
  const [placedBlocks, setPlacedBlocks] = useState<PlacedCodeBlock[]>([]);

  const sensorConns = connections.filter((c) => c.type === "sensor");
  const actuatorConns = connections.filter((c) => c.type === "actuator");

  const validateCode = (blocks: PlacedCodeBlock[]): string[] => {
    const errors: string[] = [];
    if (blocks.length === 0) {
      errors.push("Add code blocks to build your program");
      return errors;
    }
    const placedIds = new Set(blocks.map((b) => b.id));
    for (const reqId of recipe.required) {
      const def = recipe.palette.find((p) => p.id === reqId);
      if (def && !placedIds.has(reqId)) {
        errors.push(`${def.icon} Missing required block: "${def.label}"`);
      }
    }
    // Ordering: events / loops first, then reads (action) before conditions, conditions before write-like actions
    const condIdx = blocks.findIndex((b) => b.type === "condition");
    const readIdx = blocks.findIndex((b) => b.id.startsWith("read-") || b.id.startsWith("count-") || b.id.startsWith("scan-"));
    if (readIdx >= 0 && condIdx >= 0 && readIdx > condIdx) {
      errors.push("🔄 Read your sensor BEFORE checking conditions");
    }
    onValidationChange?.(errors.length === 0);
    return errors;
  };

  const codeErrors = validateCode(placedBlocks);

  const addBlock = (block: MissionCodeBlock) => {
    setPlacedBlocks((prev) => [...prev, { ...block, instanceId: `${block.id}-${Date.now()}` }]);
  };

  const removeBlock = (instanceId: string) => setPlacedBlocks((p) => p.filter((b) => b.instanceId !== instanceId));

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
    lines.push(`// === ${recipe.goal} ===`);
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

    lines.push("");
    lines.push("void setup() {");
    lines.push("  Serial.begin(9600);");
    sensorConns.forEach((c) => {
      const v = c.componentName.replace(/\s+/g, "");
      if (!c.pinId.startsWith("A")) lines.push(`  pinMode(${v}Pin, INPUT);   // ${c.componentIcon} ${c.componentName}`);
    });
    actuatorConns.forEach((c) => {
      const v = c.componentName.replace(/\s+/g, "");
      lines.push(`  pinMode(${v}Pin, OUTPUT);  // ${c.componentIcon} ${c.componentName}`);
    });
    lines.push("}");
    lines.push("");
    lines.push("void loop() {");

    let indent = "  ";
    let openBrace = false;
    placedBlocks.forEach((b) => {
      if (b.type === "event" || b.id === "on-loop") return;
      const line = b.code ?? `// ${b.label}`;
      lines.push(`${indent}${line}`);
      if (b.type === "condition") {
        indent = "    ";
        openBrace = true;
      }
    });
    if (openBrace) lines.push("  }");
    if (placedBlocks.length === 0) lines.push("  // Click blocks above to program!");
    lines.push("}");
    return lines.join("\n");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">🧩 Code Blocks</h3>
        <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground">Arduino C++</span>
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-xl p-2">
        <p className="text-[11px] font-body font-semibold text-primary">🎯 Goal: {recipe.goal}</p>
      </div>

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

      <div className="bg-muted/50 rounded-xl p-3 border border-border">
        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">👆 Click a block to add it ↓</p>
        <div className="grid grid-cols-2 gap-1.5">
          {recipe.palette.map((block) => (
            <button
              key={block.id}
              onClick={() => addBlock(block)}
              className={`${block.color} text-white rounded-lg px-3 py-2 text-xs font-display font-bold flex items-center gap-2 shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all text-left`}
            >
              <span>{block.icon}</span>
              <span className="flex-1">{block.label}</span>
              {recipe.required.includes(block.id) && (
                <span className="text-[9px] bg-white/20 px-1 rounded">REQ</span>
              )}
            </button>
          ))}
        </div>
      </div>

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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

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
