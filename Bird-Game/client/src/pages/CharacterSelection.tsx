import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BirdTypeName, BIRD_TYPES, PlayerSlot, PLAYER_CONTROLS 
} from '@shared/schema';
import { Zap, ArrowUp, Wind, User, Bot } from 'lucide-react';

const BIRD_ORDER: BirdTypeName[] = [
  'PIGEON', 'EAGLE', 'HUMMINGBIRD', 'TURKEY', 'PENGUIN',
  'SHOEBILL', 'MOCKINGBIRD', 'RAZORBILL', 'GRINCHHAWK', 'VULTURE'
];

const CONTROL_LABELS = [
  'P1: WASD + Space + Shift',
  'P2: Arrows + Enter + Down',
  'P3: TFGH + Y + U',
  'P4: IJKL + O + P'
];

interface CharacterSelectionProps {
  onStartGame: (slots: PlayerSlot[]) => void;
}

export default function CharacterSelection({ onStartGame }: CharacterSelectionProps) {
  const [, setLocation] = useLocation();
  const [playerSlots, setPlayerSlots] = useState<PlayerSlot[]>([
    { index: 0, isAI: false, selectedBird: 'PIGEON', active: true },
    { index: 1, isAI: true, selectedBird: 'EAGLE', active: true },
    { index: 2, isAI: true, selectedBird: 'HUMMINGBIRD', active: false },
    { index: 3, isAI: true, selectedBird: 'TURKEY', active: false },
  ]);
  const [selectingSlot, setSelectingSlot] = useState<number>(0);

  const handleBirdSelect = (birdType: BirdTypeName) => {
    setPlayerSlots(prev => prev.map((slot, idx) => 
      idx === selectingSlot ? { ...slot, selectedBird: birdType } : slot
    ));
  };

  const toggleAI = (slotIndex: number) => {
    setPlayerSlots(prev => prev.map((slot, idx) => 
      idx === slotIndex ? { ...slot, isAI: !slot.isAI } : slot
    ));
  };

  const toggleActive = (slotIndex: number) => {
    setPlayerSlots(prev => prev.map((slot, idx) => 
      idx === slotIndex ? { ...slot, active: !slot.active } : slot
    ));
  };

  const activePlayerCount = playerSlots.filter(s => s.active).length;
  const canStart = activePlayerCount >= 2;

  const handleStart = () => {
    onStartGame(playerSlots);
    setLocation('/game');
  };

  const currentBird = BIRD_TYPES[playerSlots[selectingSlot].selectedBird];

  return (
    <div 
      className="min-h-screen flex flex-col items-center py-6 px-4"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #B3E5FC 50%, #E0F2F1 100%)'
      }}
      data-testid="screen-character-selection"
    >
      <h1 
        className="text-5xl font-bold text-white mb-6"
        style={{ textShadow: '3px 3px 0 #166534, -1px -1px 0 #166534, 1px -1px 0 #166534, -1px 1px 0 #166534' }}
        data-testid="text-title"
      >
        BIRD BRAWL
      </h1>

      <div className="flex gap-3 mb-6 flex-wrap justify-center" data-testid="container-player-slots">
        {playerSlots.map((slot, idx) => {
          const bird = BIRD_TYPES[slot.selectedBird];
          const isSelected = selectingSlot === idx;
          
          return (
            <Card 
              key={idx}
              className={`w-64 p-3 cursor-pointer transition-all ${
                isSelected ? 'ring-4 ring-yellow-400' : ''
              } ${!slot.active ? 'opacity-50' : ''}`}
              onClick={() => slot.active && setSelectingSlot(idx)}
              data-testid={`card-player-slot-${idx}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-sm" data-testid={`text-player-label-${idx}`}>
                  Player {idx + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={slot.isAI ? 'secondary' : 'default'}
                    onClick={(e) => { e.stopPropagation(); toggleAI(idx); }}
                    disabled={!slot.active}
                    data-testid={`button-toggle-ai-${idx}`}
                  >
                    {slot.isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={slot.active ? 'default' : 'outline'}
                    onClick={(e) => { e.stopPropagation(); toggleActive(idx); }}
                    data-testid={`button-toggle-active-${idx}`}
                  >
                    {slot.active ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
              
              {slot.active && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: bird.color }}
                      data-testid={`icon-bird-preview-${idx}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" data-testid={`text-bird-name-${idx}`}>
                        {bird.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {slot.isAI ? 'AI' : 'Human'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate" data-testid={`text-controls-${idx}`}>
                    {CONTROL_LABELS[idx]}
                  </p>
                </>
              )}
            </Card>
          );
        })}
      </div>

      <div className="w-full max-w-4xl mb-4">
        <h2 className="text-xl font-bold text-center mb-3 text-gray-800" data-testid="text-select-character">
          Select Character for Player {selectingSlot + 1}
        </h2>
        
        <div className="grid grid-cols-5 gap-3" data-testid="grid-character-selection">
          {BIRD_ORDER.map((birdType) => {
            const bird = BIRD_TYPES[birdType];
            const isSelected = playerSlots[selectingSlot].selectedBird === birdType;
            
            return (
              <Card
                key={birdType}
                className={`p-3 cursor-pointer transition-all hover-elevate ${
                  isSelected ? 'ring-4 ring-yellow-400' : ''
                }`}
                onClick={() => handleBirdSelect(birdType)}
                data-testid={`card-bird-${birdType.toLowerCase()}`}
              >
                <div 
                  className="w-full aspect-square rounded-md mb-2 flex items-center justify-center"
                  style={{ backgroundColor: bird.color }}
                >
                  <div 
                    className="w-3/4 h-3/4 rounded-full"
                    style={{ backgroundColor: lightenColor(bird.color, 20) }}
                  />
                </div>
                <p className="font-bold text-sm text-center truncate" data-testid={`text-bird-card-name-${birdType.toLowerCase()}`}>
                  {bird.name}
                </p>
                <div className="flex justify-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />{bird.power}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <ArrowUp className="w-3 h-3 mr-1" />{bird.jumpHeight}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Wind className="w-3 h-3 mr-1" />{bird.speed}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="w-full max-w-4xl p-4 mb-4" data-testid="card-ability-info">
        <h3 className="font-bold text-lg mb-2" data-testid="text-selected-bird-name">
          {currentBird.name}
        </h3>
        <p className="text-sm text-muted-foreground" data-testid="text-ability-description">
          {currentBird.ability}
        </p>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Power: {currentBird.power}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Jump: {currentBird.jumpHeight}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Speed: {currentBird.speed}</span>
          </div>
        </div>
      </Card>

      <Button
        size="lg"
        className="text-xl px-12 py-6"
        disabled={!canStart}
        onClick={handleStart}
        data-testid="button-start-battle"
      >
        {canStart ? 'START BATTLE' : `Need ${2 - activePlayerCount} more player(s)`}
      </Button>
    </div>
  );
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
  const b = Math.min(255, (num & 0x0000FF) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}
