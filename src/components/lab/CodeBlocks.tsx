import { motion } from "framer-motion";
import { PlacedBlock } from "@/types/game";

interface CodeBlocksProps {
  placedBlocks: PlacedBlock[];
  board: "arduino" | "esp32" | "raspberry";
}

const boardLanguage = {
  arduino: "Arduino C++",
  esp32: "Arduino C++",
  raspberry: "Python",
};

export default function CodeBlocks({ placedBlocks, board }: CodeBlocksProps) {
  const sensors = placedBlocks.filter((b) => b.zone === "sensor");
  const controllers = placedBlocks.filter((b) => b.zone === "controller");
  const actuators = placedBlocks.filter((b) => b.zone === "actuator");

  const hasBlocks = placedBlocks.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">📝 Code Blocks</h3>
        <span className="text-xs font-bold bg-muted px-2 py-1 rounded-full text-muted-foreground">
          {boardLanguage[board]}
        </span>
      </div>

      {!hasBlocks ? (
        <div className="bg-muted rounded-2xl p-6 text-center">
          <p className="text-muted-foreground font-body text-sm">
            Add components to see the code appear here! 🧩
          </p>
        </div>
      ) : (
        <div className="bg-foreground/90 rounded-2xl p-4 font-mono text-sm space-y-1 overflow-x-auto">
          {/* Setup block */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <CodeLine color="game-purple" indent={0}>
              {board === "raspberry" ? "# Setup" : "// Setup"}
            </CodeLine>
          </motion.div>

          {sensors.map((s, i) => (
            <motion.div
              key={`setup-${i}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <CodeLine color="secondary" indent={0}>
                {board === "raspberry"
                  ? `${s.block.name.toLowerCase().replace(/\s/g, "_")} = setup_sensor("${s.block.name}", pin=${i + 2})`
                  : `int ${s.block.name.replace(/\s/g, "")} = A${i};  // ${s.block.icon} ${s.block.name}`}
              </CodeLine>
            </motion.div>
          ))}

          {actuators.map((a, i) => (
            <motion.div
              key={`act-setup-${i}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: (sensors.length + i) * 0.1 }}
            >
              <CodeLine color="accent" indent={0}>
                {board === "raspberry"
                  ? `${a.block.name.toLowerCase().replace(/\s/g, "_")} = setup_actuator("${a.block.name}", pin=${i + 10})`
                  : `int ${a.block.name.replace(/\s/g, "")} = ${i + 10};  // ${a.block.icon} ${a.block.name}`}
              </CodeLine>
            </motion.div>
          ))}

          {/* Spacer */}
          <div className="h-2" />

          {/* Loop block */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CodeLine color="game-purple" indent={0}>
              {board === "raspberry" ? "# Main Loop" : "void loop() {"}
            </CodeLine>
          </motion.div>

          {/* Read sensors */}
          {sensors.map((s, i) => (
            <motion.div
              key={`read-${i}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <CodeLine color="secondary" indent={1}>
                {board === "raspberry"
                  ? `value_${i} = ${s.block.name.toLowerCase().replace(/\s/g, "_")}.read()  # ${s.block.icon}`
                  : `int val${i} = analogRead(${s.block.name.replace(/\s/g, "")});  // ${s.block.icon}`}
              </CodeLine>
            </motion.div>
          ))}

          {/* IF-THEN logic */}
          {controllers.length > 0 && sensors.length > 0 && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <CodeLine color="game-yellow" indent={1}>
                {board === "raspberry"
                  ? `if value_0 > threshold:  # 🔀 IF → THEN`
                  : `if (val0 > THRESHOLD) {  // 🔀 IF → THEN`}
              </CodeLine>
              {actuators.map((a, i) => (
                <CodeLine key={`activate-${i}`} color="accent" indent={2}>
                  {board === "raspberry"
                    ? `${a.block.name.toLowerCase().replace(/\s/g, "_")}.activate()  # ${a.block.icon}`
                    : `digitalWrite(${a.block.name.replace(/\s/g, "")}, HIGH);  // ${a.block.icon}`}
                </CodeLine>
              ))}
              <CodeLine color="game-yellow" indent={1}>
                {board === "raspberry" ? "" : "}"}
              </CodeLine>
            </motion.div>
          )}

          {board !== "raspberry" && (
            <CodeLine color="game-purple" indent={0}>
              {"}"}
            </CodeLine>
          )}
        </div>
      )}
    </div>
  );
}

function CodeLine({
  children,
  color,
  indent,
}: {
  children: React.ReactNode;
  color: string;
  indent: number;
}) {
  const colorMap: Record<string, string> = {
    "secondary": "hsl(var(--secondary))",
    "accent": "hsl(var(--accent))",
    "game-purple": "hsl(var(--game-purple))",
    "game-yellow": "hsl(var(--game-yellow))",
    "primary": "hsl(var(--primary))",
    "destructive": "hsl(var(--destructive))",
  };

  return (
    <div
      className="flex items-center gap-2 leading-relaxed"
      style={{ paddingLeft: `${indent * 20}px` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorMap[color] || colorMap.primary }} />
      <code style={{ color: colorMap[color] || "#fff" }}>{children}</code>
    </div>
  );
}
