import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";

export interface PinConnection {
  pinId: string;
  componentId: string;
  componentName: string;
  componentIcon: string;
  type: "sensor" | "actuator";
}

interface ArduinoBoardProps {
  board: "arduino" | "esp32" | "raspberry";
  connections: PinConnection[];
  onSelectBoard: (board: "arduino" | "esp32" | "raspberry") => void;
}

const boards = {
  arduino: {
    name: "Arduino Uno R3",
    color: "hsl(var(--primary))",
    boardColor: "#1565C0",
    chipColor: "#212121",
    digitalPins: ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"],
    analogPins: ["A0", "A1", "A2", "A3", "A4", "A5"],
    powerPins: ["5V", "3.3V", "GND", "GND2", "VIN"],
  },
  esp32: {
    name: "ESP32 DevKit",
    color: "hsl(var(--secondary))",
    boardColor: "#1B5E20",
    chipColor: "#212121",
    digitalPins: ["GPIO2", "GPIO4", "GPIO5", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO19", "GPIO21", "GPIO22", "GPIO23"],
    analogPins: ["GPIO32", "GPIO33", "GPIO34", "GPIO35", "GPIO36", "GPIO39"],
    powerPins: ["3.3V", "GND", "5V", "GND2", "EN"],
  },
  raspberry: {
    name: "Raspberry Pi 4",
    color: "hsl(var(--destructive))",
    boardColor: "#2E7D32",
    chipColor: "#424242",
    digitalPins: ["GPIO2", "GPIO3", "GPIO4", "GPIO17", "GPIO27", "GPIO22", "GPIO10", "GPIO9", "GPIO11", "GPIO5", "GPIO6", "GPIO13", "GPIO19", "GPIO26"],
    analogPins: ["SDA", "SCL", "MOSI", "MISO", "SCLK", "CE0"],
    powerPins: ["5V", "5V2", "3.3V", "GND", "GND2"],
  },
};

function DroppablePin({ pinId, connection, side }: { pinId: string; connection?: PinConnection; side: "left" | "right" }) {
  const { isOver, setNodeRef } = useDroppable({ id: `pin-${pinId}`, data: { pinId } });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-1 ${side === "right" ? "flex-row-reverse" : ""}`}
    >
      {/* Wire connection line */}
      {connection && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className={`flex items-center gap-1 ${side === "right" ? "flex-row-reverse" : ""}`}
        >
          <div className="text-xs bg-card border border-border rounded px-1 py-0.5 font-bold shadow-sm whitespace-nowrap">
            {connection.componentIcon} {connection.componentName}
          </div>
          <div
            className="h-0.5 w-6"
            style={{ backgroundColor: connection.type === "sensor" ? "hsl(var(--secondary))" : "hsl(var(--accent))" }}
          />
        </motion.div>
      )}

      {/* Pin */}
      <div
        className={`relative flex items-center justify-center transition-all duration-200 ${
          isOver ? "scale-125" : ""
        }`}
      >
        {/* Metal pin */}
        <div
          className={`w-3 h-3 rounded-sm border ${
            connection
              ? "bg-secondary border-secondary shadow-[0_0_6px_hsl(var(--secondary))]"
              : isOver
              ? "bg-accent border-accent shadow-[0_0_8px_hsl(var(--accent))]"
              : "bg-zinc-400 border-zinc-500"
          }`}
        />
        {/* Pin label */}
        <span className={`absolute ${side === "left" ? "left-4" : "right-4"} text-[7px] font-mono font-bold text-zinc-300 whitespace-nowrap`}>
          {pinId}
        </span>
      </div>
    </div>
  );
}

export default function ArduinoBoard({ board, connections, onSelectBoard }: ArduinoBoardProps) {
  const info = boards[board];
  const leftPins = info.digitalPins.slice(0, 7);
  const rightPins = info.digitalPins.slice(7);
  const bottomPins = info.analogPins;

  const getConnection = (pinId: string) => connections.find((c) => c.pinId === pinId);

  return (
    <div className="space-y-3">
      {/* Board selector tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl">
        {(Object.keys(boards) as Array<"arduino" | "esp32" | "raspberry">).map((key) => (
          <button
            key={key}
            onClick={() => onSelectBoard(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-display font-bold text-xs transition-all ${
              board === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: boards[key].boardColor }}
            />
            {boards[key].name}
          </button>
        ))}
      </div>

      {/* Board visualization */}
      <motion.div
        key={board}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="relative"
      >
        {/* PCB Board */}
        <div
          className="relative rounded-xl p-1 shadow-2xl mx-auto"
          style={{
            backgroundColor: info.boardColor,
            maxWidth: 420,
            background: `linear-gradient(135deg, ${info.boardColor}, ${info.boardColor}dd)`,
          }}
        >
          {/* Board edge - screw holes */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />

          {/* PCB traces - decorative */}
          <div className="absolute inset-4 opacity-10">
            <div className="absolute top-1/4 left-0 right-0 h-px bg-zinc-300" />
            <div className="absolute top-2/4 left-0 right-0 h-px bg-zinc-300" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-zinc-300" />
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-zinc-300" />
            <div className="absolute left-2/4 top-0 bottom-0 w-px bg-zinc-300" />
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-zinc-300" />
          </div>

          <div className="relative flex">
            {/* Left pins */}
            <div className="flex flex-col justify-around py-6 gap-1 z-10 -ml-1">
              {leftPins.map((pin) => (
                <DroppablePin key={pin} pinId={pin} connection={getConnection(pin)} side="left" />
              ))}
            </div>

            {/* Board center */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[220px]">
              {/* USB port */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-zinc-600 rounded-b-sm border-x border-b border-zinc-500" />

              {/* Main chip */}
              <div
                className="w-20 h-20 rounded-lg flex items-center justify-center shadow-inner border border-zinc-600 relative"
                style={{ backgroundColor: info.chipColor }}
              >
                {/* Chip notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 rounded-b bg-zinc-500" />
                {/* Chip pins */}
                <div className="absolute left-0 top-2 bottom-2 flex flex-col justify-around">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-zinc-500 -ml-0.5" />
                  ))}
                </div>
                <div className="absolute right-0 top-2 bottom-2 flex flex-col justify-around">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-zinc-500 -mr-0.5" />
                  ))}
                </div>
                <span className="text-zinc-400 text-[8px] font-mono font-bold text-center leading-tight">
                  {board === "arduino" ? "ATmega\n328P" : board === "esp32" ? "ESP32\nWROOM" : "BCM\n2711"}
                </span>
              </div>

              {/* Board label */}
              <div className="mt-3 text-zinc-300 text-[10px] font-mono font-bold tracking-widest">
                {info.name.toUpperCase()}
              </div>

              {/* Status LEDs */}
              <div className="flex gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_4px_#4ade80] animate-pulse" />
                  <span className="text-[7px] font-mono text-zinc-400">PWR</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24]" />
                  <span className="text-[7px] font-mono text-zinc-400">TX</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24]" />
                  <span className="text-[7px] font-mono text-zinc-400">RX</span>
                </div>
                {connections.length > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_4px_#60a5fa] animate-pulse" />
                    <span className="text-[7px] font-mono text-zinc-400">L</span>
                  </div>
                )}
              </div>

              {/* Crystal oscillator */}
              <div className="absolute bottom-8 left-12 w-5 h-3 rounded-sm bg-zinc-500 border border-zinc-400 flex items-center justify-center">
                <span className="text-[5px] text-zinc-300">16M</span>
              </div>

              {/* Capacitors */}
              <div className="absolute top-12 right-12 w-3 h-3 rounded-full bg-zinc-600 border border-zinc-500" />
              <div className="absolute bottom-12 right-16 w-2 h-4 rounded-sm bg-amber-800 border border-amber-700" />
            </div>

            {/* Right pins */}
            <div className="flex flex-col justify-around py-6 gap-1 z-10 -mr-1">
              {rightPins.map((pin) => (
                <DroppablePin key={pin} pinId={pin} connection={getConnection(pin)} side="right" />
              ))}
            </div>
          </div>

          {/* Bottom pins (analog) */}
          <div className="flex justify-center gap-3 pb-2 pt-1">
            {bottomPins.map((pin) => (
              <DroppablePin key={pin} pinId={pin} connection={getConnection(pin)} side="left" />
            ))}
          </div>

          {/* Power pins row */}
          <div className="flex justify-center gap-2 pb-3">
            {info.powerPins.map((pin) => (
              <div
                key={pin}
                className="flex flex-col items-center gap-0.5"
              >
                <div className={`w-3 h-3 rounded-sm ${pin.includes("GND") ? "bg-zinc-800 border-zinc-700" : pin.includes("5V") ? "bg-red-600 border-red-500" : "bg-orange-500 border-orange-400"} border`} />
                <span className="text-[6px] font-mono font-bold text-zinc-400">{pin}</span>
              </div>
            ))}
          </div>

          {/* DC barrel jack */}
          <div className="absolute bottom-4 left-6 w-4 h-6 rounded-sm bg-zinc-800 border border-zinc-600" />
        </div>

        {/* Drop zone indicator */}
        <p className="text-center text-xs font-body text-muted-foreground mt-2 font-semibold">
          ⬆️ Drag components onto pins to connect them
        </p>
      </motion.div>
    </div>
  );
}
