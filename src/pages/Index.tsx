import { useState } from "react";
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

  // Unlock missions based on completion count
  const getUnlockedMissions = () => {
    const completed = gameState.completedMissions.length;
    return missions.map((m) => ({
      ...m,
      unlocked: m.difficulty === "easy" || (m.difficulty === "medium" && completed >= 1) || (m.difficulty === "hard" && completed >= 3),
    }));
  };

  const activeMissions = getUnlockedMissions();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* City Map Background */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src={cityMapBg}
          alt="Smart City Map"
          className="w-full h-full object-cover"
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-transparent to-foreground/20" />
      </motion.div>

      {/* Top Bar */}
      <TopBar gameState={gameState} onBadgesClick={() => setShowBadges(true)} />

      {/* Mission Markers */}
      <div className="absolute inset-0">
        {activeMissions.map((mission) => (
          <MissionMarker
            key={mission.id}
            mission={mission}
            isCompleted={gameState.completedMissions.includes(mission.id)}
            onClick={() => handleMissionClick(mission)}
          />
        ))}
      </div>

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
