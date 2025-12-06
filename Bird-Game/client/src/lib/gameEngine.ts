import { 
  Bird, Platform, PowerUp, Particle, CrowMinion, GameState, 
  BirdTypeName, BIRD_TYPES, GAME_CONFIG, PLAYER_CONTROLS,
  PowerUpType, POWER_UP_CONFIGS, KillFeedEntry
} from '@shared/schema';

export function createBird(
  startX: number, 
  type: BirdTypeName, 
  playerIndex: number,
  isAI: boolean
): Bird {
  const birdConfig = BIRD_TYPES[type];
  return {
    x: startX,
    y: GAME_CONFIG.GROUND_Y - 80,
    vx: 0,
    vy: 0,
    type,
    facingRight: true,
    playerIndex,
    health: 100,
    name: `${isAI ? 'AI' : 'P'}${playerIndex + 1}: ${birdConfig.name}`,
    stunTime: 0,
    specialCooldown: 0,
    specialMaxCooldown: 120,
    attackCooldown: 0,
    canDoubleJump: true,
    loungeActive: false,
    loungeX: 0,
    loungeY: 0,
    diveTimer: 0,
    isGroundPounding: false,
    carrionSwarmTimer: 0,
    crowSwarmCooldown: 0,
    isFlying: false,
    speedMultiplier: 1.0,
    powerMultiplier: 1.0,
    sizeMultiplier: 1.0,
    speedTimer: 0,
    rageTimer: 0,
    shrinkTimer: 0,
    isAI,
  };
}

export function createInitialPlatforms(): Platform[] {
  const platforms: Platform[] = [];
  const { WIDTH } = GAME_CONFIG;
  
  platforms.push({ x: 80, y: 540, w: 80, h: 20 });
  platforms.push({ x: 65, y: 470, w: 110, h: 20 });
  platforms.push({ x: 50, y: 400, w: 140, h: 20 });
  platforms.push({ x: 35, y: 330, w: 170, h: 20 });
  
  platforms.push({ x: WIDTH - 160, y: 540, w: 80, h: 20 });
  platforms.push({ x: WIDTH - 175, y: 470, w: 110, h: 20 });
  platforms.push({ x: WIDTH - 190, y: 400, w: 140, h: 20 });
  platforms.push({ x: WIDTH - 205, y: 330, w: 170, h: 20 });
  
  const rand = () => Math.random();
  for (let i = 0; i < 2; i++) {
    const px = 280 + rand() * (WIDTH - 700);
    const py = 200 + rand() * 200;
    const pw = 200 + rand() * 140;
    platforms.push({ x: px, y: py, w: pw, h: 20 });
  }
  
  return platforms;
}

export function isOnGround(bird: Bird, platforms: Platform[]): boolean {
  const bottom = bird.y + 80 * bird.sizeMultiplier;
  if (bottom >= GAME_CONFIG.GROUND_Y) return true;
  
  for (const p of platforms) {
    const birdCenterX = bird.x + 40 * bird.sizeMultiplier;
    if (birdCenterX >= p.x && birdCenterX <= p.x + p.w && 
        bottom >= p.y && bottom <= p.y + p.h + 10) {
      return true;
    }
  }
  return false;
}

export function createParticle(
  x: number, y: number, vx: number, vy: number, color: string, life: number = 60
): Particle {
  return { x, y, vx, vy, color, life, maxLife: life };
}

export function spawnImpactParticles(
  x: number, y: number, damage: number, particles: Particle[]
): void {
  const count = Math.min(50, 3 + damage * 2);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2 - Math.PI / 4;
    const speed = 3 + Math.random() * (damage * 0.3);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 3;
    const color = Math.random() < 0.6 ? '#ffffff' : 'rgba(220, 20, 20, 0.8)';
    particles.push(createParticle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, vx, vy, color));
  }
}

export function spawnGroundPoundParticles(x: number, y: number, particles: Particle[]): void {
  for (let i = 0; i < 80; i++) {
    const angle = (i / 80) * Math.PI * 2;
    const speed = 4 + Math.random() * 10;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 5;
    const color = Math.random() < 0.7 ? '#92400e' : '#d4a574';
    particles.push(createParticle(x + 40, y + 70, vx, vy, color));
  }
  for (let i = 0; i < 20; i++) {
    const vx = (Math.random() - 0.5) * 20;
    const vy = -8 - Math.random() * 10;
    particles.push(createParticle(x + 40, y + 70, vx, vy, '#6b7280'));
  }
}

export function spawnCrowMinions(bird: Bird, crowMinions: CrowMinion[]): void {
  const crowCount = 14 + Math.floor(Math.random() * 8);
  for (let i = 0; i < crowCount; i++) {
    const offsetX = (Math.random() - 0.5) * 160;
    const offsetY = (Math.random() - 0.5) * 120;
    crowMinions.push({
      x: bird.x + 40 + offsetX,
      y: bird.y + 40 + offsetY,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      age: 0,
      ownerIndex: bird.playerIndex,
    });
  }
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.4;
    p.life--;
    return p.life > 0 && p.y < GAME_CONFIG.HEIGHT + 100;
  });
}

export function updateCrowMinions(
  crowMinions: CrowMinion[], 
  players: (Bird | null)[], 
  particles: Particle[],
  addToKillFeed: (msg: string) => void
): CrowMinion[] {
  return crowMinions.filter(c => {
    c.age++;
    
    let closest: Bird | null = null;
    let best = 99999;
    
    for (const b of players) {
      if (b === null || b.health <= 0 || b.playerIndex === c.ownerIndex) continue;
      const d = Math.hypot(b.x + 40 - c.x, b.y + 40 - c.y);
      if (d < best) {
        best = d;
        closest = b;
      }
    }
    
    if (closest) {
      const dx = closest.x + 40 - c.x;
      const dy = closest.y + 40 - c.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > 0) {
        const speed = 2.8;
        c.vx += (dx / dist) * 0.18;
        c.vy += (dy / dist) * 0.18;
        
        const speedNow = Math.hypot(c.vx, c.vy);
        if (speedNow > speed) {
          c.vx = (c.vx / speedNow) * speed;
          c.vy = (c.vy / speedNow) * speed;
        }
      }
      
      if (dist < 45) {
        closest.health -= 5;
        if (closest.health < 0) closest.health = 0;
        addToKillFeed(`CROW pecks ${closest.name.split(':')[0].trim()}! -5 HP`);
        closest.vx += c.vx * 0.8;
        closest.vy -= 5;
        
        for (let i = 0; i < 10; i++) {
          particles.push(createParticle(
            c.x, c.y,
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.8) * 10,
            '#991b1b'
          ));
        }
        return false;
      }
    }
    
    c.x += c.vx;
    c.y += c.vy;
    
    return c.age <= 900 && c.y <= GAME_CONFIG.HEIGHT + 200 && 
           c.x > -300 && c.x < GAME_CONFIG.WIDTH + 300;
  });
}

export function trySpawnPowerUp(
  powerUps: PowerUp[], 
  lastSpawnTime: number, 
  currentTime: number
): { powerUps: PowerUp[]; lastSpawnTime: number } {
  if (currentTime - lastSpawnTime < GAME_CONFIG.POWERUP_SPAWN_INTERVAL) {
    return { powerUps, lastSpawnTime };
  }
  
  if (Math.random() < 0.6) {
    const x = 140 + Math.random() * (GAME_CONFIG.WIDTH - 280);
    const y = 140 + Math.random() * (GAME_CONFIG.HEIGHT - 350);
    const types: PowerUpType[] = ['HEALTH', 'SPEED', 'RAGE', 'SHRINK'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push({ x, y, type, floatOffset: 0 });
  }
  
  return { powerUps, lastSpawnTime: currentTime };
}

export function checkPowerUpPickup(bird: Bird, powerUps: PowerUp[]): PowerUp[] {
  return powerUps.filter(p => {
    const dx = bird.x + 40 - p.x;
    const dy = bird.y + 40 - p.y;
    if (Math.hypot(dx, dy) < 50) {
      switch (p.type) {
        case 'HEALTH':
          bird.health = Math.min(100, bird.health + 40);
          break;
        case 'SPEED':
          bird.speedMultiplier = 1.8;
          bird.speedTimer = 300;
          break;
        case 'RAGE':
          bird.powerMultiplier = 2.5;
          bird.rageTimer = 300;
          break;
        case 'SHRINK':
          bird.sizeMultiplier = 0.6;
          bird.shrinkTimer = 300;
          break;
      }
      return false;
    }
    return true;
  });
}

export function performAttack(
  attacker: Bird, 
  players: (Bird | null)[], 
  particles: Particle[],
  addToKillFeed: (msg: string) => void
): { shakeIntensity: number; hitstopFrames: number } {
  if (attacker.health <= 0) return { shakeIntensity: 0, hitstopFrames: 0 };
  
  const config = BIRD_TYPES[attacker.type];
  let range = 120 * attacker.sizeMultiplier;
  let dmg = Math.floor(config.power * 2 * attacker.powerMultiplier);
  
  if (attacker.type === 'RAZORBILL' && attacker.diveTimer > 0) {
    range = 200;
    dmg = Math.floor(config.power * 4 * attacker.powerMultiplier);
  }
  
  let shakeIntensity = 0;
  let hitstopFrames = 0;
  
  for (const other of players) {
    if (other === null || other === attacker || other.health <= 0) continue;
    
    const dist = Math.abs(attacker.x - other.x);
    if (dist < range && Math.abs(attacker.y - other.y) < 100) {
      const kb = config.power * (attacker.facingRight ? 1 : -1) * 1.8;
      other.vx += kb;
      other.vy -= 5;
      
      const oldHealth = other.health;
      other.health -= dmg;
      if (other.health < 0) other.health = 0;
      
      const damageDealt = oldHealth - other.health;
      
      if (damageDealt >= 5) {
        spawnImpactParticles(other.x + 40, other.y + 40, damageDealt, particles);
        
        const attackerName = attacker.name.split(':')[0].trim();
        const victimName = other.name.split(':')[0].trim();
        const verb = (attacker.type === 'RAZORBILL' && attacker.diveTimer > 0) ? 'DIVEBOMBED' :
                     damageDealt >= 35 ? 'BRUTALIZED' :
                     damageDealt >= 25 ? 'SMASHED' : 'hit';
        
        addToKillFeed(`${attackerName} ${verb} ${victimName}! -${damageDealt} HP`);
        
        if (other.health <= 0) {
          addToKillFeed(`ELIMINATED ${victimName}!`);
        }
      }
      
      if (damageDealt >= 20) {
        shakeIntensity = Math.min(20, damageDealt / 2);
        hitstopFrames = Math.min(12, 4 + Math.floor(damageDealt / 5));
      }
    }
  }
  
  return { shakeIntensity, hitstopFrames };
}

export function performSpecial(
  bird: Bird, 
  players: (Bird | null)[], 
  particles: Particle[],
  crowMinions: CrowMinion[],
  addToKillFeed: (msg: string) => void
): { shakeIntensity: number; hitstopFrames: number } {
  if (bird.health <= 0) return { shakeIntensity: 0, hitstopFrames: 0 };
  
  const config = BIRD_TYPES[bird.type];
  let shakeIntensity = 0;
  let hitstopFrames = 0;
  
  switch (bird.type) {
    case 'PIGEON':
      bird.health = Math.min(100, bird.health + 15);
      bird.canDoubleJump = true;
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push(createParticle(
          bird.x + 40, bird.y + 40,
          Math.cos(angle) * 6, Math.sin(angle) * 6 - 3,
          '#22c55e'
        ));
      }
      break;
      
    case 'EAGLE':
      bird.vx += (bird.facingRight ? 1 : -1) * config.speed * 2.0;
      const eagleAttack = performAttack(bird, players, particles, addToKillFeed);
      shakeIntensity = eagleAttack.shakeIntensity;
      hitstopFrames = eagleAttack.hitstopFrames;
      break;
      
    case 'HUMMINGBIRD':
      bird.vy -= config.jumpHeight * 0.8;
      for (let i = 0; i < 30; i++) {
        particles.push(createParticle(
          bird.x + 40 + (Math.random() - 0.5) * 30, 
          bird.y + 60,
          (Math.random() - 0.5) * 8, 
          3 + Math.random() * 5,
          '#22c55e'
        ));
      }
      break;
      
    case 'TURKEY':
      bird.vy = -config.jumpHeight * 1.5;
      bird.isGroundPounding = true;
      break;
      
    case 'PENGUIN':
      bird.vx = (bird.facingRight ? 1 : -1) * 18.0;
      bird.vy = 0;
      for (const other of players) {
        if (other === null || other === bird || other.health <= 0) continue;
        if (Math.abs(other.y - bird.y) < 90 && Math.abs(other.x - bird.x) < 140) {
          other.stunTime = 120;
        }
      }
      for (let i = 0; i < 40; i++) {
        particles.push(createParticle(
          bird.x + 40, bird.y + 60,
          (bird.facingRight ? -1 : 1) * (3 + Math.random() * 8),
          (Math.random() - 0.5) * 4,
          '#67e8f9'
        ));
      }
      break;
      
    case 'SHOEBILL':
      for (const other of players) {
        if (other === null || other === bird || other.health <= 0) continue;
        if (Math.abs(bird.x - other.x) < 130) {
          other.stunTime = 150;
          for (let i = 0; i < 15; i++) {
            particles.push(createParticle(
              other.x + 40, other.y + 40,
              (Math.random() - 0.5) * 10, -Math.random() * 8,
              '#06b6d4'
            ));
          }
        }
      }
      shakeIntensity = 8;
      hitstopFrames = 6;
      break;
      
    case 'MOCKINGBIRD':
      bird.loungeActive = true;
      bird.loungeX = bird.x + 40;
      bird.loungeY = bird.y + 40;
      break;
      
    case 'RAZORBILL':
      bird.vy += 20;
      let dir = 1;
      for (const other of players) {
        if (other !== null && other !== bird) {
          dir = other.x > bird.x ? 1 : -1;
          break;
        }
      }
      bird.vx += dir * config.speed * 2.0;
      bird.diveTimer = 90;
      for (let i = 0; i < 25; i++) {
        particles.push(createParticle(
          bird.x + 40, bird.y + 40,
          (Math.random() - 0.5) * 12, -Math.random() * 8,
          '#4338ca'
        ));
      }
      break;
      
    case 'GRINCHHAWK':
      let stolen = 0;
      for (const other of players) {
        if (other === null || other === bird || other.health <= 0) continue;
        const take = Math.min(12, other.health);
        other.health -= take;
        stolen += take;
        
        if (take > 0) {
          const thief = bird.name.split(':')[0].trim();
          const victim = other.name.split(':')[0].trim();
          addToKillFeed(`${thief} STOLE ${take} HP from ${victim}!`);
          
          for (let i = 0; i < take * 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            particles.push(createParticle(
              other.x + 40, other.y + 40,
              Math.cos(angle) * 5 * 0.7, Math.sin(angle) * 5 - 2,
              '#991b1b'
            ));
          }
        }
      }
      bird.health = Math.min(100, bird.health + stolen);
      shakeIntensity = Math.min(15, stolen / 2);
      hitstopFrames = 8;
      break;
      
    case 'VULTURE':
      if (bird.crowSwarmCooldown > 0) break;
      
      addToKillFeed(`${bird.name.split(':')[0].trim()} SUMMONS THE MURDER!`);
      spawnCrowMinions(bird, crowMinions);
      
      shakeIntensity = 15;
      hitstopFrames = 10;
      bird.carrionSwarmTimer = 80;
      
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push(createParticle(
          bird.x + 40, bird.y + 40,
          Math.cos(angle) * (4 + Math.random() * 10),
          Math.sin(angle) * (4 + Math.random() * 10) - 5,
          '#0a0a14'
        ));
      }
      
      bird.crowSwarmCooldown = 600;
      bird.specialCooldown = 600;
      bird.specialMaxCooldown = 600;
      break;
  }
  
  return { shakeIntensity, hitstopFrames };
}

export function handleGroundPound(
  bird: Bird, 
  players: (Bird | null)[], 
  particles: Particle[],
  addToKillFeed: (msg: string) => void,
  platforms: Platform[]
): { shakeIntensity: number; hitstopFrames: number } {
  if (bird.type !== 'TURKEY' || !bird.isGroundPounding || !isOnGround(bird, platforms) || bird.vy < 0) {
    return { shakeIntensity: 0, hitstopFrames: 0 };
  }
  
  bird.isGroundPounding = false;
  
  addToKillFeed(`${bird.name.split(':')[0].trim()} SLAMMED THE GROUND!`);
  spawnGroundPoundParticles(bird.x, bird.y, particles);
  
  for (const other of players) {
    if (other === null || other === bird || other.health <= 0) continue;
    const dx = other.x - bird.x;
    if (Math.abs(dx) < 280 && Math.abs(other.y - bird.y) < 180) {
      const dmg = Math.floor(30 * bird.powerMultiplier);
      other.health = Math.max(0, other.health - dmg);
      other.vx += dx > 0 ? 20 : -20;
      other.vy -= 12;
      
      addToKillFeed(`${bird.name.split(':')[0].trim()} POUNDED ${other.name.split(':')[0].trim()}! -${dmg} HP`);
      if (other.health <= 0) {
        addToKillFeed(`ELIMINATED ${other.name.split(':')[0].trim()}!`);
      }
    }
  }
  
  return { shakeIntensity: 22, hitstopFrames: 15 };
}

export function updateBirdAI(bird: Bird, players: (Bird | null)[], pressedKeys: Set<string>): void {
  const controls = PLAYER_CONTROLS[bird.playerIndex];
  
  let target: Bird | null = null;
  let bestDist = Infinity;
  
  for (const b of players) {
    if (b === null || b === bird || b.health <= 0) continue;
    const d = Math.hypot(b.x - bird.x, b.y - bird.y);
    if (d < bestDist) {
      bestDist = d;
      target = b;
    }
  }
  
  if (!target) return;
  
  bird.facingRight = target.x > bird.x;
  
  pressedKeys.delete(controls.left);
  pressedKeys.delete(controls.right);
  pressedKeys.delete(controls.jump);
  pressedKeys.delete(controls.attack);
  pressedKeys.delete(controls.special);
  
  if (target.x < bird.x - 80) pressedKeys.add(controls.left);
  if (target.x > bird.x + 80) pressedKeys.add(controls.right);
  if (target.y < bird.y - 120 || bird.vy > 5) pressedKeys.add(controls.jump);
  if (bestDist < 140 && bird.attackCooldown <= 0) pressedKeys.add(controls.attack);
  if (bestDist < 200 && bird.specialCooldown <= 0 && Math.random() < 0.04) pressedKeys.add(controls.special);
}

export function updateBird(
  bird: Bird,
  pressedKeys: Set<string>,
  platforms: Platform[],
  players: (Bird | null)[],
  particles: Particle[],
  crowMinions: CrowMinion[],
  powerUps: PowerUp[],
  addToKillFeed: (msg: string) => void
): { 
  shakeIntensity: number; 
  hitstopFrames: number; 
  powerUps: PowerUp[];
} {
  const controls = PLAYER_CONTROLS[bird.playerIndex];
  const config = BIRD_TYPES[bird.type];
  
  if (bird.isAI) {
    updateBirdAI(bird, players, pressedKeys);
  }
  
  if (bird.speedTimer > 0) bird.speedTimer--;
  else bird.speedMultiplier = 1.0;
  
  if (bird.rageTimer > 0) bird.rageTimer--;
  else bird.powerMultiplier = 1.0;
  
  if (bird.shrinkTimer > 0) bird.shrinkTimer--;
  else bird.sizeMultiplier = 1.0;
  
  bird.stunTime = Math.max(0, bird.stunTime - 1);
  if (bird.specialCooldown > 0) bird.specialCooldown--;
  if (bird.crowSwarmCooldown > 0) bird.crowSwarmCooldown--;
  if (bird.attackCooldown > 0) bird.attackCooldown--;
  bird.diveTimer = Math.max(0, bird.diveTimer - 1);
  if (bird.carrionSwarmTimer > 0) bird.carrionSwarmTimer--;
  
  if (bird.type === 'MOCKINGBIRD' && bird.loungeActive) {
    const dx = bird.x + 40 - bird.loungeX;
    const dy = bird.y + 40 - bird.loungeY;
    if (Math.hypot(dx, dy) < 70) {
      bird.health = Math.min(100, bird.health + 0.02);
    }
  }
  
  const stunned = bird.stunTime > 0;
  const airborne = !isOnGround(bird, platforms);
  
  bird.vy += GAME_CONFIG.GRAVITY;
  
  if (bird.type === 'VULTURE' && !stunned && pressedKeys.has(controls.jump)) {
    bird.isFlying = true;
    bird.vy -= 0.78;
    if (bird.vy < -7.5) bird.vy = -7.5;
  } else if (bird.type === 'VULTURE') {
    bird.isFlying = false;
  }
  
  if (!stunned && pressedKeys.has(controls.jump) && airborne && bird.type !== 'VULTURE') {
    bird.vy -= config.flyUpForce;
  }
  
  let shakeIntensity = 0;
  let hitstopFrames = 0;
  
  if (!stunned) {
    let targetVx = 0;
    const airFric = airborne ? 0.90 : 0.75;
    const accel = airborne ? 0.20 : 0.45;
    
    if (pressedKeys.has(controls.left)) targetVx = -config.speed * bird.speedMultiplier;
    else if (pressedKeys.has(controls.right)) targetVx = config.speed * bird.speedMultiplier;
    
    bird.vx = bird.vx * airFric + targetVx * accel;
    if (Math.abs(bird.vx) > 0.1) bird.facingRight = bird.vx > 0;
    
    const onGround = isOnGround(bird, platforms);
    const canJump = onGround || (bird.type === 'PIGEON' && bird.canDoubleJump);
    
    if (pressedKeys.has(controls.jump) && canJump) {
      const mult = onGround ? 1.0 : 0.75;
      bird.vy = -config.jumpHeight * mult;
      if (!onGround && bird.type === 'PIGEON') bird.canDoubleJump = false;
    }
    
    if (pressedKeys.has(controls.attack) && bird.attackCooldown <= 0) {
      const attackResult = performAttack(bird, players, particles, addToKillFeed);
      shakeIntensity = Math.max(shakeIntensity, attackResult.shakeIntensity);
      hitstopFrames = Math.max(hitstopFrames, attackResult.hitstopFrames);
      bird.attackCooldown = 30;
    }
    
    if (pressedKeys.has(controls.special) && bird.specialCooldown <= 0) {
      const specialResult = performSpecial(bird, players, particles, crowMinions, addToKillFeed);
      shakeIntensity = Math.max(shakeIntensity, specialResult.shakeIntensity);
      hitstopFrames = Math.max(hitstopFrames, specialResult.hitstopFrames);
      
      if (bird.type === 'GRINCHHAWK') {
        bird.specialCooldown = 600;
        bird.specialMaxCooldown = 600;
      } else if (bird.type !== 'VULTURE') {
        bird.specialCooldown = 120;
        bird.specialMaxCooldown = 120;
      }
    }
  } else {
    bird.vx *= 0.92;
  }
  
  if (!pressedKeys.has(controls.left) && !pressedKeys.has(controls.right)) {
    bird.vx *= airborne ? 0.96 : 0.80;
  }
  
  bird.x += bird.vx;
  bird.y += bird.vy;
  
  if (bird.x < 0) bird.x = 0;
  if (bird.x > GAME_CONFIG.WIDTH - 100 * bird.sizeMultiplier) {
    bird.x = GAME_CONFIG.WIDTH - 100 * bird.sizeMultiplier;
  }
  
  if (bird.vy >= 0) {
    let hit = false;
    let newY = bird.y;
    const bottom = bird.y + 80 * bird.sizeMultiplier;
    
    for (const p of platforms) {
      const birdCenterX = bird.x + 40 * bird.sizeMultiplier;
      if (birdCenterX >= p.x && birdCenterX <= p.x + p.w && 
          bottom >= p.y && bird.y < p.y) {
        newY = p.y - 80 * bird.sizeMultiplier;
        hit = true;
        break;
      }
    }
    
    if (!hit && bottom >= GAME_CONFIG.GROUND_Y) {
      newY = GAME_CONFIG.GROUND_Y - 80 * bird.sizeMultiplier;
      hit = true;
    }
    
    if (hit) {
      bird.y = newY;
      bird.vy = 0;
      bird.canDoubleJump = true;
    }
  }
  
  const groundPoundResult = handleGroundPound(bird, players, particles, addToKillFeed, platforms);
  shakeIntensity = Math.max(shakeIntensity, groundPoundResult.shakeIntensity);
  hitstopFrames = Math.max(hitstopFrames, groundPoundResult.hitstopFrames);
  
  if (bird.y > GAME_CONFIG.HEIGHT + 100) {
    bird.health = 0;
  }
  
  if (bird.type === 'VULTURE' && bird.health > 0) {
    for (const b of players) {
      if (b !== null && b !== bird && b.health <= 0 && 
          b.y > GAME_CONFIG.HEIGHT + 50 && b.y <= GAME_CONFIG.HEIGHT + 100) {
        bird.health = Math.min(100, bird.health + 8);
        addToKillFeed(`${bird.name.split(':')[0].trim()} FEASTS! +8 HP`);
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          particles.push(createParticle(
            b.x + 40, b.y + 40,
            Math.cos(angle) * 4, Math.sin(angle) * 4 - 3,
            '#991b1b'
          ));
        }
      }
    }
  }
  
  const newPowerUps = checkPowerUpPickup(bird, powerUps);
  
  return { shakeIntensity, hitstopFrames, powerUps: newPowerUps };
}
