import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { missions } from "@/data/gameData";
import { Mission } from "@/types/game";
import { useGameState } from "@/hooks/useGameState";
import cityMapBg from "@/assets/city-map-bg.jpg";
import MissionMarker from "@/components/MissionMarker";
import MissionModal from "@/components/MissionModal";
import TopBar from "@/components/TopBar";
import AIGuide from "@/components/AIGuide";
import BadgesModal from "@/components/BadgesModal";

const Index = () => {
  const { state: gameState, completeMission, earnBadge } = useGameState();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [guideMsg, setGuideMsg] = useState<string | undefined>();
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMissionClick = (mission: Mission) => {
    if (!mission.unlocked) {
      setGuideMsg("🔒 Complete easier missions first to unlock this one!");
      return;
    }
    if (gameState.completedMissions.includes(mission.id)) {
      setGuideMsg(`✅ You already completed "${mission.title}"! Try another mission!`);
      return;
    }
    setSelectedMission(mission);
  };

  const handleComplete = (missionId: string, xp: number) => {
    completeMission(missionId, xp);
    if (gameState.completedMissions.length === 0) {
      earnBadge("first-mission");
    }
    setGuideMsg("🎉 Awesome work! Look for the next mission on the map!");
  };

  const getUnlockedMissions = () => {
    const completed = gameState.completedMissions.length;
    return missions.map((m) => ({
      ...m,
      unlocked: m.difficulty === "easy" || (m.difficulty === "medium" && completed >= 2) || (m.difficulty === "hard" && completed >= 4),
    }));
  };

  const activeMissions = getUnlockedMissions();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Scrollable City Map */}
      <motion.div
        ref={mapRef}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative w-full h-full">
          <img
            src={cityMapBg}
            alt="Smart City Map"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 via-transparent to-foreground/10" />

          {/* Mission Markers */}
          {activeMissions.map((mission) => (
            <MissionMarker
              key={mission.id}
              mission={mission}
              isCompleted={gameState.completedMissions.includes(mission.id)}
              onClick={() => handleMissionClick(mission)}
            />
          ))}
        </div>
      </motion.div>

      {/* Top Bar - fixed */}
      <TopBar gameState={gameState} onBadgesClick={() => setShowBadges(true)} />

      {/* AI Guide */}
      <AIGuide message={guideMsg} />

      {/* Mission Modal */}
      {selectedMission && (
        <MissionModal
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
          onComplete={handleComplete}
        />
      )}

      {/* Badges Modal */}
      {showBadges && (
        <BadgesModal gameState={gameState} onClose={() => setShowBadges(false)} />
      )}
    </div>
  );
};

export default Index;
