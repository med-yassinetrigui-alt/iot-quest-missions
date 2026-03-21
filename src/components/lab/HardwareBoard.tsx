import { useState } from "react";
import { motion } from "framer-motion";
import { PlacedBlock } from "@/types/game";

interface HardwareBoardProps {
  board: "arduino" | "esp32" | "raspberry";
  connectedBlocks: PlacedBlock[];
  onSelectBoard: (board: "arduino" | "esp32" | "raspberry") => void;
}

const boardInfo = {
  arduino: {
    name: "Arduino Uno",
    icon: "🟦",
    color: "hsl(var(--primary))",
    pins: ["D2", "D3", "D4", "D5", "A0", "A1", "A2", "A3"],
    desc: "Great for simple sensor projects!",
  },
  esp32: {
    name: "ESP32",
    icon: "🟩",
    color: "hsl(var(--secondary))",
    pins: ["GPIO2", "GPIO4", "GPIO5", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16"],
    desc: "WiFi + Bluetooth built in!",
  },
  raspberry: {
    name: "Raspberry Pi",
    icon: "🟥",
    color: "hsl(var(--destructive))",
    pins: ["GPIO2", "GPIO3", "GPIO4", "GPIO17", "GPIO27", "GPIO22", "GPIO5", "GPIO6"],
    desc: "A full computer for advanced IoT!",
  },
};

export default function HardwareBoard({ board, connectedBlocks, onSelectBoard }: HardwareBoardProps) {
  const info = boardInfo[board];
  const sensors = connectedBlocks.filter((b) => b.zone === "sensor");
  const actuators = connectedBlocks.filter((b) => b.zone === "actuator");

  return (
    <div className="space-y-3">
      {/* Board selector */}
      <div className="flex gap-2">
        {(Object.keys(boardInfo) as Array<"arduino" | "esp32" | "raspberry">).map((key) => (
          <button
            key={key}
            onClick={() => onSelectBoard(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-body font-bold text-sm transition-all border-2 ${
              board === key
                ? "border-primary bg-primary/10 text-foreground scale-105"
                : "border-border bg-card text-muted-foreground hover:border-primary/50"
            }`}
          >
            <span className="text-lg">{boardInfo[key].icon}</span>
            {boardInfo[key].name}
          </button>
        ))}
      </div>

      {/* Board visual */}
      <motion.div
        key={board}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-card rounded-2xl border-2 border-border p-4 overflow-hidden"
      >
        {/* Board header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: info.color + "20" }}
          >
            {info.icon}
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground">{info.name}</h4>
            <p className="text-xs text-muted-foreground font-body">{info.desc}</p>
          </div>
        </div>

        {/* Board body with pins */}
        <div className="relative bg-muted rounded-xl p-4 min-h-[160px]">
          {/* Board chip visual */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-lg border-2 border-border bg-card flex items-center justify-center">
            <span className="text-2xl">{info.icon}</span>
          </div>

          {/* Left pins (sensors) */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around py-2">
            {info.pins.slice(0, 4).map((pin, i) => {
              const connected = sensors[i];
              return (
                <div key={pin} className="flex items-center gap-1">
                  <div
                    className={`w-6 h-4 rounded-r-md text-[8px] font-bold flex items-center justify-center ${
                      connected
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {pin}
                  </div>
                  {connected && (
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center"
                    >
                      <div className="w-6 h-0.5 bg-secondary" />
                      <span className="text-xs bg-secondary/20 rounded px-1">
                        {connected.block.icon}
                      </span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right pins (actuators) */}
          <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around py-2">
            {info.pins.slice(4).map((pin, i) => {
              const connected = actuators[i];
              return (
                <div key={pin} className="flex items-center gap-1 flex-row-reverse">
                  <div
                    className={`w-6 h-4 rounded-l-md text-[8px] font-bold flex items-center justify-center ${
                      connected
                        ? "bg-accent text-accent-foreground"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {pin}
                  </div>
                  {connected && (
                    <motion.div
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center"
                    >
                      <span className="text-xs bg-accent/20 rounded px-1">
                        {connected.block.icon}
                      </span>
                      <div className="w-6 h-0.5 bg-accent" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Connection status */}
        <div className="mt-3 flex items-center gap-2 text-xs font-body font-bold text-muted-foreground">
          <span className={`w-2 h-2 rounded-full ${connectedBlocks.length > 0 ? "bg-secondary animate-pulse" : "bg-border"}`} />
          {connectedBlocks.length > 0
            ? `${connectedBlocks.length} component(s) connected`
            : "No components connected yet"}
        </div>
      </motion.div>
    </div>
  );
}
