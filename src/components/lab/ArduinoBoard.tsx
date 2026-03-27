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
  onRemoveConnection?: (pinId: string) => void;
}

const boards = {
  arduino: {
    name: "Arduino Uno R3",
    boardColor: "#1565C0",
    chipColor: "#212121",
    digitalPins: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"],
    analogPins: ["A0", "A1", "A2", "A3", "A4", "A5"],
    powerPins: ["5V", "3.3V", "GND", "GND2", "VIN"],
    sensorPins: ["A0", "A1", "A2", "A3", "A4", "A5", "D2", "D3"],
    actuatorPins: ["D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"],
  },
  esp32: {
    name: "ESP32 DevKit",
    boardColor: "#1B5E20",
    chipColor: "#212121",
    digitalPins: ["GPIO2", "GPIO4", "GPIO5", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO19", "GPIO21"],
    analogPins: ["GPIO32", "GPIO33", "GPIO34", "GPIO35", "GPIO36", "GPIO39"],
    powerPins: ["3.3V", "GND", "5V", "GND2", "EN"],
    sensorPins: ["GPIO32", "GPIO33", "GPIO34", "GPIO35", "GPIO36", "GPIO39", "GPIO2", "GPIO4"],
    actuatorPins: ["GPIO5", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO19", "GPIO21"],
  },
  raspberry: {
    name: "Raspberry Pi 4",
    boardColor: "#2E7D32",
    chipColor: "#424242",
    digitalPins: ["GPIO2", "GPIO3", "GPIO4", "GPIO17", "GPIO27", "GPIO22", "GPIO10", "GPIO9", "GPIO11", "GPIO5", "GPIO6", "GPIO13"],
    analogPins: ["SDA", "SCL", "MOSI", "MISO", "SCLK", "CE0"],
    powerPins: ["5V", "5V2", "3.3V", "GND", "GND2"],
    sensorPins: ["GPIO2", "GPIO3", "GPIO4", "GPIO17", "GPIO27", "GPIO22"],
    actuatorPins: ["GPIO10", "GPIO9", "GPIO11", "GPIO5", "GPIO6", "GPIO13"],
  },
};

function DroppablePin({
  pinId,
  connection,
  side,
  pinType,
  onRemove,
}: {
  pinId: string;
  connection?: PinConnection;
  side: "left" | "right" | "bottom";
  pinType: "sensor" | "actuator" | "both";
  onRemove?: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `pin-${pinId}`, data: { pinId, pinType } });

  const isAnalog = pinId.startsWith("A") || pinId.startsWith("SDA") || pinId.startsWith("SCL") || pinId.startsWith("MO") || pinId.startsWith("MI") || pinId.startsWith("SC") || pinId.startsWith("CE");

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-1 ${side === "right" ? "flex-row-reverse" : ""} ${
        side === "bottom" ? "flex-col" : ""
      }`}
    >
      {/* Wire connection line */}
      {connection && side !== "bottom" && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className={`flex items-center gap-1 ${side === "right" ? "flex-row-reverse" : ""}`}
        >
          <button
            onClick={onRemove}
            className="text-xs bg-card border border-border rounded px-1 py-0.5 font-bold shadow-sm whitespace-nowrap hover:border-destructive hover:bg-destructive/10 transition-colors group"
            title="Click to disconnect"
          >
            {connection.componentIcon} {connection.componentName}
            <span className="text-destructive ml-1 opacity-0 group-hover:opacity-100 text-[8px]">✕</span>
          </button>
          <div
            className="h-0.5 w-6"
            style={{ backgroundColor: connection.type === "sensor" ? "hsl(var(--secondary))" : "hsl(var(--accent))" }}
          />
        </motion.div>
      )}

      {connection && side === "bottom" && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="flex flex-col items-center gap-0.5"
        >
          <div
            className="w-0.5 h-4"
            style={{ backgroundColor: connection.type === "sensor" ? "hsl(var(--secondary))" : "hsl(var(--accent))" }}
          />
          <button
            onClick={onRemove}
            className="text-[8px] bg-card border border-border rounded px-1 py-0.5 font-bold shadow-sm whitespace-nowrap hover:border-destructive transition-colors"
            title="Click to disconnect"
          >
            {connection.componentIcon} {connection.componentName}
          </button>
        </motion.div>
      )}

      {/* Pin */}
      <div
        className={`relative flex items-center justify-center transition-all duration-200 ${
          isOver ? "scale-150" : ""
        }`}
      >
        <div
          className={`w-3 h-3 rounded-sm border ${
            connection
              ? connection.type === "sensor"
                ? "bg-secondary border-secondary shadow-[0_0_6px_hsl(var(--secondary))]"
                : "bg-accent border-accent shadow-[0_0_6px_hsl(var(--accent))]"
              : isOver
              ? "bg-primary border-primary shadow-[0_0_10px_hsl(var(--primary))] ring-2 ring-primary/50"
              : isAnalog
              ? "bg-amber-500 border-amber-600"
              : "bg-zinc-400 border-zinc-500"
          }`}
        />
        <span
          className={`absolute ${
            side === "left" ? "left-4" : side === "right" ? "right-4" : "top-4"
          } text-[7px] font-mono font-bold whitespace-nowrap ${
            connection ? "text-white" : isAnalog ? "text-amber-300" : "text-zinc-300"
          }`}
        >
          {pinId}
        </span>
      </div>
    </div>
  );
}

export default function ArduinoBoard({ board, connections, onSelectBoard, onRemoveConnection }: ArduinoBoardProps) {
  const info = boards[board];
  const leftPins = info.digitalPins.slice(0, 6);
  const rightPins = info.digitalPins.slice(6);
  const bottomPins = info.analogPins;

  const getConnection = (pinId: string) => connections.find((c) => c.pinId === pinId);

  const getPinType = (pinId: string): "sensor" | "actuator" | "both" => {
    if (info.sensorPins.includes(pinId) && info.actuatorPins.includes(pinId)) return "both";
    if (info.sensorPins.includes(pinId)) return "sensor";
    return "actuator";
  };

  return (
    <div className="space-y-3">
      {/* Board selector */}
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
        <div
          className="relative rounded-xl p-1 shadow-2xl mx-auto"
          style={{
            backgroundColor: info.boardColor,
            maxWidth: 420,
            background: `linear-gradient(135deg, ${info.boardColor}, ${info.boardColor}dd)`,
          }}
        >
          {/* Screw holes */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />

          {/* PCB traces */}
          <div className="absolute inset-4 opacity-10">
            <div className="absolute top-1/4 left-0 right-0 h-px bg-zinc-300" />
            <div className="absolute top-2/4 left-0 right-0 h-px bg-zinc-300" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-zinc-300" />
          </div>

          <div className="relative flex">
            {/* Left pins (digital low) */}
            <div className="flex flex-col justify-around py-6 gap-1 z-10 -ml-1">
              {leftPins.map((pin) => (
                <DroppablePin
                  key={pin}
                  pinId={pin}
                  connection={getConnection(pin)}
                  side="left"
                  pinType={getPinType(pin)}
                  onRemove={() => onRemoveConnection?.(pin)}
                />
              ))}
            </div>

            {/* Board center */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[220px]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-zinc-600 rounded-b-sm border-x border-b border-zinc-500" />

              <div
                className="w-20 h-20 rounded-lg flex items-center justify-center shadow-inner border border-zinc-600 relative"
                style={{ backgroundColor: info.chipColor }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 rounded-b bg-zinc-500" />
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

              <div className="absolute bottom-8 left-12 w-5 h-3 rounded-sm bg-zinc-500 border border-zinc-400 flex items-center justify-center">
                <span className="text-[5px] text-zinc-300">16M</span>
              </div>
              <div className="absolute top-12 right-12 w-3 h-3 rounded-full bg-zinc-600 border border-zinc-500" />
            </div>

            {/* Right pins (digital high) */}
            <div className="flex flex-col justify-around py-6 gap-1 z-10 -mr-1">
              {rightPins.map((pin) => (
                <DroppablePin
                  key={pin}
                  pinId={pin}
                  connection={getConnection(pin)}
                  side="right"
                  pinType={getPinType(pin)}
                  onRemove={() => onRemoveConnection?.(pin)}
                />
              ))}
            </div>
          </div>

          {/* Bottom pins (analog — best for sensors) */}
          <div className="flex justify-center gap-3 pb-2 pt-1">
            {bottomPins.map((pin) => (
              <DroppablePin
                key={pin}
                pinId={pin}
                connection={getConnection(pin)}
                side="bottom"
                pinType={getPinType(pin)}
                onRemove={() => onRemoveConnection?.(pin)}
              />
            ))}
          </div>

          {/* Power pins */}
          <div className="flex justify-center gap-2 pb-3">
            {info.powerPins.map((pin) => (
              <div key={pin} className="flex flex-col items-center gap-0.5">
                <div className={`w-3 h-3 rounded-sm ${pin.includes("GND") ? "bg-zinc-800 border-zinc-700" : pin.includes("5V") ? "bg-red-600 border-red-500" : "bg-orange-500 border-orange-400"} border`} />
                <span className="text-[6px] font-mono font-bold text-zinc-400">{pin}</span>
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 left-6 w-4 h-6 rounded-sm bg-zinc-800 border border-zinc-600" />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[9px] font-mono text-muted-foreground">Analog (sensors)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-zinc-400" />
            <span className="text-[9px] font-mono text-muted-foreground">Digital (outputs)</span>
          </div>
        </div>
        <p className="text-center text-xs font-body text-muted-foreground mt-1 font-semibold">
          ⬆️ Drag components onto pins to connect them
        </p>
      </motion.div>
    </div>
  );
}
