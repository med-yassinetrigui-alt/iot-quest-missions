import { useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import BadgesModal from "@/components/BadgesModal";
import { useNavigate } from "react-router-dom";

export default function BadgesPage() {
  const { state } = useGameState();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen pt-14 p-4 bg-gradient-to-br from-background via-muted to-background">
      {open && (
        <BadgesModal
          gameState={state}
          onClose={() => {
            setOpen(false);
            navigate("/");
          }}
        />
      )}
    </div>
  );
}
