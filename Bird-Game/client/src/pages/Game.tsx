import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Bird, Platform, PowerUp, Particle, CrowMinion, 
  PlayerSlot, GameState, GAME_CONFIG, KillFeedEntry
} from '@shared/schema';
import { 
  createBird, createInitialPlatforms, updateBird, 
  updateParticles, updateCrowMinions, trySpawnPowerUp
} from '@/lib/gameEngine';
import { renderGame } from '@/lib/gameRenderer';

interface GameProps {
  playerSlots: PlayerSlot[];
}

export default function Game({ playerSlots }: GameProps) {
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>(0);
  const [gameOver, setGameOver] = useState(false);

  const initializeGame = useCallback(() => {
    const activeSlots = playerSlots.filter(s => s.active);
    const startPositions = [100, 400, 700, 1000];
    
    const players: (Bird | null)[] = [];
    activeSlots.forEach((slot, idx) => {
      const bird = createBird(
        startPositions[idx],
        slot.selectedBird,
        idx,
        slot.isAI
      );
      players.push(bird);
    });

    gameStateRef.current = {
      phase: 'playing',
      players,
      platforms: createInitialPlatforms(),
      powerUps: [],
      particles: [],
      crowMinions: [],
      killFeed: [],
      shakeIntensity: 0,
      hitstopFrames: 0,
      lastPowerUpSpawnTime: Date.now(),
      winner: null,
    };
    
    setGameOver(false);
  }, [playerSlots]);

  const addToKillFeed = useCallback((message: string) => {
    if (!gameStateRef.current) return;
    
    gameStateRef.current.killFeed.unshift({
      message,
      timestamp: Date.now(),
    });
    
    if (gameStateRef.current.killFeed.length > GAME_CONFIG.MAX_KILL_FEED) {
      gameStateRef.current.killFeed.pop();
    }
  }, []);

  const gameLoop = useCallback(() => {
    const state = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!state || !canvas) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (state.hitstopFrames > 0) {
      state.hitstopFrames--;
      renderGame(
        ctx, state.players, state.platforms, state.powerUps,
        state.particles, state.crowMinions, state.killFeed,
        state.shakeIntensity, state.phase === 'gameOver', state.winner
      );
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (state.phase === 'playing') {
      let maxShake = 0;
      let maxHitstop = 0;

      for (const bird of state.players) {
        if (bird && bird.health > 0) {
          const result = updateBird(
            bird,
            pressedKeysRef.current,
            state.platforms,
            state.players,
            state.particles,
            state.crowMinions,
            state.powerUps,
            addToKillFeed
          );
          state.powerUps = result.powerUps;
          maxShake = Math.max(maxShake, result.shakeIntensity);
          maxHitstop = Math.max(maxHitstop, result.hitstopFrames);
        }
      }

      state.shakeIntensity = Math.max(state.shakeIntensity * 0.9, maxShake);
      if (state.shakeIntensity < 0.5) state.shakeIntensity = 0;
      
      if (maxHitstop > state.hitstopFrames) {
        state.hitstopFrames = maxHitstop;
      }

      state.particles = updateParticles(state.particles);
      state.crowMinions = updateCrowMinions(
        state.crowMinions, state.players, state.particles, addToKillFeed
      );

      const spawnResult = trySpawnPowerUp(
        state.powerUps, state.lastPowerUpSpawnTime, Date.now()
      );
      state.powerUps = spawnResult.powerUps;
      state.lastPowerUpSpawnTime = spawnResult.lastSpawnTime;

      for (const p of state.powerUps) {
        p.floatOffset += 0.08;
      }

      const alivePlayers = state.players.filter(b => b && b.health > 0);
      if (alivePlayers.length <= 1) {
        state.phase = 'gameOver';
        state.winner = alivePlayers[0] || null;
        setGameOver(true);
      }
    }

    renderGame(
      ctx, state.players, state.platforms, state.powerUps,
      state.particles, state.crowMinions, state.killFeed,
      state.shakeIntensity, state.phase === 'gameOver', state.winner
    );

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [addToKillFeed]);

  useEffect(() => {
    initializeGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setLocation('/');
        return;
      }
      pressedKeysRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initializeGame, gameLoop, setLocation]);

  return (
    <div 
      className="w-screen h-screen flex items-center justify-center bg-black overflow-hidden"
      data-testid="screen-game"
    >
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.WIDTH}
        height={GAME_CONFIG.HEIGHT}
        className="max-w-full max-h-full"
        style={{ 
          imageRendering: 'pixelated',
          aspectRatio: `${GAME_CONFIG.WIDTH}/${GAME_CONFIG.HEIGHT}`
        }}
        data-testid="canvas-game"
      />
    </div>
  );
}
