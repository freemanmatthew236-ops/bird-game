import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import CharacterSelection from "@/pages/CharacterSelection";
import Game from "@/pages/Game";
import NotFound from "@/pages/not-found";
import { PlayerSlot } from '@shared/schema';

function App() {
  const [playerSlots, setPlayerSlots] = useState<PlayerSlot[]>([
    { index: 0, isAI: false, selectedBird: 'PIGEON', active: true },
    { index: 1, isAI: true, selectedBird: 'EAGLE', active: true },
    { index: 2, isAI: true, selectedBird: 'HUMMINGBIRD', active: false },
    { index: 3, isAI: true, selectedBird: 'TURKEY', active: false },
  ]);

  const handleStartGame = (slots: PlayerSlot[]) => {
    setPlayerSlots(slots);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/">
            <CharacterSelection onStartGame={handleStartGame} />
          </Route>
          <Route path="/game">
            <Game playerSlots={playerSlots} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
