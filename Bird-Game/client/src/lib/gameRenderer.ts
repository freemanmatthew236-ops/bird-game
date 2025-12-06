import { 
  Bird, Platform, PowerUp, Particle, CrowMinion, 
  BIRD_TYPES, GAME_CONFIG, POWER_UP_CONFIGS, KillFeedEntry
} from '@shared/schema';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  players: (Bird | null)[],
  platforms: Platform[],
  powerUps: PowerUp[],
  particles: Particle[],
  crowMinions: CrowMinion[],
  killFeed: KillFeedEntry[],
  shakeIntensity: number,
  gameOver: boolean,
  winner: Bird | null
): void {
  const { WIDTH, HEIGHT, GROUND_Y } = GAME_CONFIG;
  
  ctx.save();
  
  if (shakeIntensity > 0) {
    const shakeX = (Math.random() - 0.5) * shakeIntensity * 2;
    const shakeY = (Math.random() - 0.5) * shakeIntensity * 2;
    ctx.translate(shakeX, shakeY);
  }
  
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(0.5, '#B3E5FC');
  gradient.addColorStop(1, '#E0F2F1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  renderParticles(ctx, particles);
  renderGround(ctx);
  renderPlatforms(ctx, platforms);
  renderPowerUps(ctx, powerUps);
  renderCrowMinions(ctx, crowMinions);
  
  for (const bird of players) {
    if (bird && bird.health > 0) {
      renderBird(ctx, bird);
    }
  }
  
  renderHUD(ctx, players, killFeed);
  
  if (gameOver) {
    renderGameOver(ctx, winner);
  }
  
  ctx.restore();
}

function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderGround(ctx: CanvasRenderingContext2D): void {
  const { WIDTH, HEIGHT, GROUND_Y } = GAME_CONFIG;
  
  ctx.fillStyle = '#166534';
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  
  ctx.fillStyle = '#3f2d1f';
  ctx.fillRect(110, GROUND_Y - 70, 28, 70);
  ctx.fillRect(WIDTH - 138, GROUND_Y - 70, 28, 70);
}

function renderPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[]): void {
  for (const p of platforms) {
    if (p.y < GAME_CONFIG.GROUND_Y - 35) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2, p.y - 10, p.w / 2 + 20, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  }
}

function renderPowerUps(ctx: CanvasRenderingContext2D, powerUps: PowerUp[]): void {
  for (const p of powerUps) {
    const offset = Math.sin(p.floatOffset) * 10;
    const config = POWER_UP_CONFIGS[p.type];
    
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 15;
    
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y + offset, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(config.text, p.x, p.y + offset + 5);
  }
}

function renderCrowMinions(ctx: CanvasRenderingContext2D, crowMinions: CrowMinion[]): void {
  for (const c of crowMinions) {
    const pulse = 1.0 + 0.2 * Math.sin(c.age * 0.3);
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 10 * pulse, 8 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1e1e28';
    ctx.beginPath();
    ctx.ellipse(c.x - 10, c.y, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x + 10, c.y, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(c.x - 3, c.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(c.x + 3, c.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderBird(ctx: CanvasRenderingContext2D, bird: Bird): void {
  const config = BIRD_TYPES[bird.type];
  const drawSize = 80 * bird.sizeMultiplier;
  const x = bird.x;
  const y = bird.y;
  
  if (bird.type === 'VULTURE') {
    renderVulture(ctx, bird, x, y, drawSize);
  } else {
    renderGenericBird(ctx, bird, config.color, x, y, drawSize);
  }
  
  if (bird.stunTime > 0) {
    ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FROZEN!', x + drawSize / 2, y - 20);
  }
  
  renderSpecialCooldown(ctx, bird, x, y, drawSize);
  
  if (bird.type === 'MOCKINGBIRD' && bird.loungeActive) {
    renderLounge(ctx, bird.loungeX, bird.loungeY);
  }
  
  renderBirdLabel(ctx, bird, x, y);
}

function renderVulture(ctx: CanvasRenderingContext2D, bird: Bird, x: number, y: number, drawSize: number): void {
  const wingSpread = bird.isFlying ? 1.5 : 1.0;
  
  ctx.fillStyle = '#140a1e';
  ctx.beginPath();
  ctx.ellipse(x - 20 * wingSpread + drawSize / 2, y + 50, 35 * wingSpread, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + drawSize - 15 * wingSpread, y + 50, 35 * wingSpread, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#140a1e';
  ctx.beginPath();
  ctx.ellipse(x + drawSize / 2, y + drawSize / 2, drawSize / 2, drawSize / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#b41e1e';
  ctx.beginPath();
  ctx.ellipse(x + 27, y + 22, 25, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#8b0000';
  ctx.beginPath();
  ctx.arc(x + 25, y + 25, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 45, y + 25, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#ff2222';
  ctx.beginPath();
  ctx.arc(x + 28, y + 28, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 48, y + 28, 4, 0, Math.PI * 2);
  ctx.fill();
  
  if (bird.carrionSwarmTimer > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(x + drawSize / 2, y + drawSize / 2, drawSize / 2 + 30, drawSize / 2 + 40, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderGenericBird(ctx: CanvasRenderingContext2D, bird: Bird, color: string, x: number, y: number, drawSize: number): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x + drawSize / 2, y + drawSize / 2, drawSize / 2, drawSize / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = lightenColor(color, 30);
  const beakX = bird.facingRight ? x + drawSize * 0.6 : x - drawSize * 0.1;
  ctx.beginPath();
  ctx.ellipse(beakX, y + drawSize * 0.35, drawSize * 0.35, drawSize * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  const eyeX = bird.facingRight ? x + drawSize * 0.55 : x + drawSize * 0.25;
  ctx.beginPath();
  ctx.arc(eyeX, y + drawSize * 0.3, drawSize * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#000000';
  const pupilX = bird.facingRight ? eyeX + 3 : eyeX - 3;
  ctx.beginPath();
  ctx.arc(pupilX, y + drawSize * 0.32, drawSize * 0.09, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  if (bird.facingRight) {
    ctx.moveTo(x + drawSize, y + drawSize * 0.5);
    ctx.lineTo(x + drawSize + 15, y + drawSize * 0.55);
    ctx.lineTo(x + drawSize, y + drawSize * 0.6);
  } else {
    ctx.moveTo(x, y + drawSize * 0.5);
    ctx.lineTo(x - 15, y + drawSize * 0.55);
    ctx.lineTo(x, y + drawSize * 0.6);
  }
  ctx.fill();
}

function renderLounge(ctx: CanvasRenderingContext2D, loungeX: number, loungeY: number): void {
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(loungeX - 60, loungeY - 40, 120, 80, 15);
  ctx.fill();
  
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('LOUNGE', loungeX, loungeY + 5);
}

function renderSpecialCooldown(ctx: CanvasRenderingContext2D, bird: Bird, x: number, y: number, drawSize: number): void {
  if (bird.specialCooldown <= 0 || bird.specialMaxCooldown <= 0) return;
  
  const ratio = bird.specialCooldown / bird.specialMaxCooldown;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.beginPath();
  ctx.roundRect(x - 5, y + drawSize + 8, 90, 14, 5);
  ctx.fill();
  
  let fillColor = '#ef4444';
  if (ratio < 0.66) fillColor = '#f97316';
  if (ratio < 0.33) fillColor = '#22d3ee';
  
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.roundRect(x, y + drawSize + 11, 80 * (1 - ratio), 8, 4);
  ctx.fill();
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 5, y + drawSize + 8, 90, 14, 5);
  ctx.stroke();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  
  let text: string;
  if (bird.type === 'VULTURE' && bird.crowSwarmCooldown > 0) {
    text = 'CROWS';
  } else {
    text = `${Math.ceil(bird.specialCooldown / 60)}s`;
  }
  ctx.fillText(text, x + 40, y + drawSize + 19);
}

function renderBirdLabel(ctx: CanvasRenderingContext2D, bird: Bird, x: number, y: number): void {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  
  const text = `${bird.name} ${bird.health}%`;
  ctx.strokeText(text, x + 40, y - 10);
  ctx.fillText(text, x + 40, y - 10);
}

function renderHUD(ctx: CanvasRenderingContext2D, players: (Bird | null)[], killFeed: KillFeedEntry[]): void {
  const { WIDTH, HEIGHT } = GAME_CONFIG;
  
  let slotIndex = 0;
  for (const bird of players) {
    if (bird) {
      const positions = [
        { x: 20, y: 20 },
        { x: WIDTH - 240, y: 20 },
        { x: 20, y: HEIGHT - 90 },
        { x: WIDTH - 240, y: HEIGHT - 90 },
      ];
      const pos = positions[slotIndex];
      renderHealthBar(ctx, bird, pos.x, pos.y);
      slotIndex++;
    }
  }
  
  renderKillFeed(ctx, killFeed);
  renderControlsHint(ctx);
}

function renderHealthBar(ctx: CanvasRenderingContext2D, bird: Bird, x: number, y: number): void {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(bird.name, x, y - 5);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(x, y, 220, 28, 5);
  ctx.fill();
  
  const healthWidth = (bird.health / 100) * 210;
  let healthColor = '#22c55e';
  if (bird.health < 60) healthColor = '#eab308';
  if (bird.health < 30) healthColor = '#ef4444';
  
  ctx.fillStyle = healthColor;
  ctx.beginPath();
  ctx.roundRect(x + 5, y + 5, healthWidth, 18, 3);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${bird.health}%`, x + 110, y + 19);
  
  const buffY = y + 32;
  let buffX = x;
  
  if (bird.speedTimer > 0) {
    renderBuffIcon(ctx, buffX, buffY, '#06b6d4', 'SPD');
    buffX += 45;
  }
  if (bird.rageTimer > 0) {
    renderBuffIcon(ctx, buffX, buffY, '#f97316', 'RGE');
    buffX += 45;
  }
  if (bird.shrinkTimer > 0) {
    renderBuffIcon(ctx, buffX, buffY, '#a855f7', 'SHK');
  }
}

function renderBuffIcon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, text: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, 40, 18, 4);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + 20, y + 13);
}

function renderKillFeed(ctx: CanvasRenderingContext2D, killFeed: KillFeedEntry[]): void {
  const { WIDTH } = GAME_CONFIG;
  const now = Date.now();
  
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'right';
  
  let visibleIndex = 0;
  for (let i = 0; i < killFeed.length && visibleIndex < 6; i++) {
    const entry = killFeed[i];
    const age = now - entry.timestamp;
    if (age > 5000) continue;
    
    const alpha = Math.max(0, 1 - age / 5000);
    
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.6})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.strokeText(entry.message, WIDTH - 20, 50 + visibleIndex * 24);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.fillText(entry.message, WIDTH - 20, 50 + visibleIndex * 24);
    
    visibleIndex++;
  }
}

function renderControlsHint(ctx: CanvasRenderingContext2D): void {
  const { WIDTH, HEIGHT } = GAME_CONFIG;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.beginPath();
  ctx.roundRect(15, HEIGHT - 45, WIDTH - 30, 35, 8);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    'P1: WASD + Space + Shift  |  P2: Arrows + Enter + Down  |  P3: TFGH + Y + U  |  P4: IJKL + O + P',
    WIDTH / 2,
    HEIGHT - 22
  );
}

function renderGameOver(ctx: CanvasRenderingContext2D, winner: Bird | null): void {
  const { WIDTH, HEIGHT } = GAME_CONFIG;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    winner ? `${winner.name} WINS!` : 'DRAW!',
    WIDTH / 2,
    HEIGHT / 2 - 20
  );
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '32px Arial';
  ctx.fillText('Press ESC for Menu', WIDTH / 2, HEIGHT / 2 + 50);
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
  const b = Math.min(255, (num & 0x0000FF) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}
