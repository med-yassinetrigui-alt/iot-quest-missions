import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { IoTBlock } from "@/types/game";

interface ComponentTrayProps {
  sensors: IoTBlock[];
  actuators: IoTBlock[];
}

function DraggableComponent({ block, type }: { block: IoTBlock; type: "sensor" | "actuator" }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${block.id}`,
    data: { block, type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const componentVisuals: Record<string, { visual: React.ReactNode; color: string }> = {
    light: {
      visual: (
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-amber-300 border-2 border-amber-500 shadow-[0_0_8px_#fbbf24]" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-zinc-400 rounded-b" />
        </div>
      ),
      color: "border-amber-400",
    },
    motion: {
      visual: (
        <div className="relative">
          <div className="w-8 h-5 rounded bg-white border-2 border-zinc-300 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-zinc-800" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-2 bg-zinc-400" />
        </div>
      ),
      color: "border-purple-400",
    },
    temp: {
      visual: (
        <div className="relative flex flex-col items-center">
          <div className="w-2 h-6 bg-gradient-to-t from-red-500 to-red-200 rounded-t-full border border-zinc-400" />
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-zinc-400 -mt-1" />
        </div>
      ),
      color: "border-red-400",
    },
    water: {
      visual: (
        <div className="w-7 h-8 bg-zinc-600 rounded border-2 border-zinc-500 flex flex-col items-center justify-end p-0.5">
          <div className="w-full bg-blue-400 rounded-b" style={{ height: "60%" }} />
        </div>
      ),
      color: "border-blue-400",
    },
    air: {
      visual: (
        <div className="w-8 h-6 rounded bg-zinc-700 border-2 border-zinc-500 flex items-center justify-center gap-0.5">
          <div className="w-1 h-3 bg-green-400 rounded-full" />
          <div className="w-1 h-2 bg-yellow-400 rounded-full" />
          <div className="w-1 h-4 bg-red-400 rounded-full" />
        </div>
      ),
      color: "border-green-400",
    },
    camera: {
      visual: (
        <div className="w-8 h-6 rounded bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-zinc-400 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
        </div>
      ),
      color: "border-zinc-400",
    },
    counter: {
      visual: (
        <div className="w-8 h-5 rounded bg-zinc-700 border-2 border-zinc-500 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </div>
      ),
      color: "border-orange-400",
    },
    energy: {
      visual: (
        <div className="w-7 h-7 rounded bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center">
          <span className="text-yellow-400 text-sm font-bold">⚡</span>
        </div>
      ),
      color: "border-yellow-400",
    },
    led: {
      visual: (
        <div className="relative flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-600 shadow-[0_0_10px_#ef4444]" />
          <div className="flex gap-1 mt-0.5">
            <div className="w-0.5 h-3 bg-zinc-400" />
            <div className="w-0.5 h-2 bg-zinc-400" />
          </div>
        </div>
      ),
      color: "border-red-400",
    },
    alarm: {
      visual: (
        <div className="relative">
          <div className="w-7 h-5 rounded-t-full bg-yellow-500 border-2 border-yellow-600" />
          <div className="w-5 h-1 bg-zinc-600 mx-auto rounded-b" />
        </div>
      ),
      color: "border-yellow-500",
    },
    motor: {
      visual: (
        <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-zinc-500 flex items-center justify-center">
          <div className="w-4 h-1 bg-zinc-400 rounded" />
          <div className="absolute w-1 h-4 bg-zinc-400 rounded" />
        </div>
      ),
      color: "border-zinc-400",
    },
    display: {
      visual: (
        <div className="w-10 h-6 rounded bg-zinc-900 border-2 border-zinc-600 p-0.5">
          <div className="w-full h-full bg-green-900 rounded-sm flex items-center justify-center">
            <span className="text-green-400 text-[6px] font-mono">IoT</span>
          </div>
        </div>
      ),
      color: "border-green-500",
    },
    sms: {
      visual: (
        <div className="w-6 h-8 rounded bg-zinc-800 border-2 border-zinc-600 flex flex-col items-center justify-center gap-0.5 p-0.5">
          <div className="w-4 h-4 bg-blue-500 rounded-sm" />
          <div className="w-3 h-1 rounded bg-zinc-500" />
        </div>
      ),
      color: "border-blue-500",
    },
    traffic: {
      visual: (
        <div className="w-4 h-10 rounded bg-zinc-800 border-2 border-zinc-600 flex flex-col items-center justify-around py-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_4px_#eab308]" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]" />
        </div>
      ),
      color: "border-emerald-400",
    },
  };

  const visual = componentVisuals[block.id] || {
    visual: <span className="text-2xl">{block.icon}</span>,
    color: "border-border",
  };

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-card border-2 ${visual.color} cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-shadow select-none`}
    >
      {visual.visual}
      <span className="text-[9px] font-display font-bold text-foreground text-center leading-tight mt-1">
        {block.name}
      </span>
      <span className={`text-[7px] font-mono px-1.5 rounded-full ${
        type === "sensor" ? "bg-secondary/20 text-secondary" : "bg-accent/20 text-accent"
      }`}>
        {type === "sensor" ? "INPUT" : "OUTPUT"}
      </span>
    </motion.div>
  );
}

export default function ComponentTray({ sensors, actuators }: ComponentTrayProps) {
  return (
    <div className="space-y-3">
      {/* Sensors */}
      <div>
        <h4 className="font-display text-xs font-bold text-secondary mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          SENSORS (INPUT)
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {sensors.map((block) => (
            <DraggableComponent key={block.id} block={block} type="sensor" />
          ))}
        </div>
      </div>

      {/* Actuators */}
      <div>
        <h4 className="font-display text-xs font-bold text-accent mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-accent" />
          ACTUATORS (OUTPUT)
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {actuators.map((block) => (
            <DraggableComponent key={block.id} block={block} type="actuator" />
          ))}
        </div>
      </div>
    </div>
  );
}
