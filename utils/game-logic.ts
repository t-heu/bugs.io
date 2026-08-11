import { generateFood } from "@/utils/food"
import { ARENA_SIZE, FOOD_VALUE_HEATH, FOOD_VALUE_SCORE } from "@/utils/game-constants"
import { Player, GameRoom } from '@/app/interfaces';

export function handlePlayerAttack(
  player: Player,
  otherPlayers: any[],
  lastPoisonTickRef: any,
  exchangeGameRoomData: any,
  updatedPlayer: any,
  updateRoomIfHost: any,
  abilityEffects: { hasSpecialAttack?: boolean; hasPoisonCarrier?: boolean; hasSlowCarrier?: boolean } = {}
) {
  const attackRange = 50;
  const damagedUIDs = new Set();

  otherPlayers.forEach((targetPlayer: Player) => {
    const dist = Math.hypot(
      targetPlayer.position.x - player.position.x,
      targetPlayer.position.y - player.position.y
    );
    if (dist > attackRange) return;
    if (damagedUIDs.has(targetPlayer.uid)) return;
    if (targetPlayer.effects?.shieldExpiresAt && targetPlayer.effects.shieldExpiresAt > Date.now()) return;

    damagedUIDs.add(targetPlayer.uid);

    const playerAttack = player.stats.attack * (player.size / 30);
    const multiplier = abilityEffects.hasSpecialAttack ? player.ability.damageMultiplier : 1.5;
    const damageToTarget = playerAttack * multiplier;

    const newHealthTarget = Math.max(0, targetPlayer.stats.health - damageToTarget);

    updateRoomIfHost?.((room: GameRoom) => ({
      ...room,
      players: room.players.map(p =>
        p.uid === targetPlayer.uid ? { ...p, stats: { ...p.stats, health: newHealthTarget } } : p
      )
    }));
    
    exchangeGameRoomData(JSON.stringify({
      type: 'player_health',
      uid: targetPlayer.uid,
      health: newHealthTarget,
      lastUpdate: Date.now()
    }));

    if (abilityEffects.hasPoisonCarrier) {
      // Bônus contra um tipo específico de inseto (ex: Vespa Esmeralda vs barata) —
      // compara o TIPO do personagem (targetPlayer.type, ex: "cockroach"),
      // não o uid da sessão (que nunca ia bater com o valor do insects.json).
      const bonus = player.ability?.specialBonusDamage;
      const bonusDamage = bonus && bonus.target === targetPlayer.type ? (bonus.bonusDamage || 0) : 0;
      const poisonDamagePerTick = (player.ability.poisonDamage || 0) + bonusDamage;

      // Envenena o ALVO que acabou de ser atingido, não quem está atacando,
      // e já manda quanto de dano por tick — assim quem toma o dano é sempre
      // a própria vítima tickando o valor certo, e não cada cliente conectado
      // calculando com o próprio poisonDamage (que causava dano duplicado/errado).
      exchangeGameRoomData(JSON.stringify({
        type: 'Poison',
        uid: targetPlayer.uid,
        duration: Date.now() + player.ability.duration,
        poisonDamagePerTick,
        lastUpdate: Date.now()
      }));

      lastPoisonTickRef.current[targetPlayer.uid] = Date.now();
    }

    if (abilityEffects.hasSlowCarrier) {
      // Slow Strike agora só afeta quem foi realmente atingido pelo ataque,
      // não todo mundo visível no mapa.
      exchangeGameRoomData(JSON.stringify({
        type: 'Slow Strike',
        uid: targetPlayer.uid,
        slowAmount: player.ability.slowAmount || 0.35,
        duration: Date.now() + player.ability.duration,
        lastUpdate: Date.now()
      }));
    }

    if (targetPlayer.name && newHealthTarget === 0) {
      updatedPlayer.killer = `${player.name} - (${player.type})`;

      exchangeGameRoomData(JSON.stringify({
        type: 'player_kill',
        uid: targetPlayer.uid,
        killer: `${player.name} - (${player.type})`,
        lastUpdate: Date.now()
      }));

      const newScore = player.score + 15;
      updatedPlayer.score = newScore

      exchangeGameRoomData(JSON.stringify({
        type: 'player_score',
        uid: player.uid,
        score: newScore,
        lastUpdate: Date.now()
      }));
    }
  });
}

// Cada jogador cuida do próprio tick de veneno (não depende de nenhum outro
// cliente estar olhando pra ele). O dano por tick já vem gravado no efeito
// (poisonDamagePerTick), definido por quem aplicou o veneno no momento do
// acerto — então o valor certo é usado sempre, e o dano só é aplicado uma vez
// por segundo, não uma vez por segundo POR CLIENTE conectado.
export function applySelfPoisonTick(
  now: number,
  player: Player,
  lastPoisonSelfTickRef: any
): { ticked: boolean; newHealth: number } {
  const isPoisoned = player.effects?.poisonedExpiresAt && player.effects.poisonedExpiresAt > now;
  if (!isPoisoned) return { ticked: false, newHealth: player.stats.health };

  const lastTick = lastPoisonSelfTickRef.current[player.uid] || 0;
  if (now - lastTick <= 1000) return { ticked: false, newHealth: player.stats.health };

  lastPoisonSelfTickRef.current[player.uid] = now;

  const damage = player.effects.poisonDamagePerTick || 0;
  if (damage <= 0) return { ticked: false, newHealth: player.stats.health };

  return { ticked: true, newHealth: Math.max(0, player.stats.health - damage) };
}

export function updatePlayerPosition(
  speed: any, 
  isMobile: any, 
  joystickActive: any, 
  joystickAngle: any,
  joystickDistance: any,
  keys: any,
  player: Player
) {
  let dx = 0, dy = 0

  if (isMobile && joystickActive) {
    dx = Math.cos(joystickAngle) * joystickDistance * speed
    dy = Math.sin(joystickAngle) * joystickDistance * speed
  } else {
    if (keys.up) dy -= speed
    if (keys.down) dy += speed
    if (keys.left) dx -= speed
    if (keys.right) dx += speed

    if (dx !== 0 && dy !== 0) {
      const normalizationFactor = 1 / Math.sqrt(2);
      dx *= normalizationFactor;
      dy *= normalizationFactor;
    }
  }

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const newX = Math.round(clamp(player.position.x + dx, 0, ARENA_SIZE));
  const newY = Math.round(clamp(player.position.y + dy, 0, ARENA_SIZE));
  return { newX, newY, dx, dy }
}

export function handleCactusCollision(x: number, y: number, cactusList: any[], player: Player) {
  let tookDamage = false;
  let newHealth = player.stats.health;
  const now = Date.now();

  cactusList.forEach((cactus) => {
    const distance = Math.hypot(x - cactus.x, y - cactus.y);
    const collisionThreshold = (player.size + cactus.size) / 2;

    if (distance < collisionThreshold) {
      const timeSinceLastHit = now - (cactus.lastHit ?? 0);

      if (timeSinceLastHit > 500) {
        cactus.lastHit = now;
        newHealth = Math.max(0, player.stats.health - 5);
        tookDamage = true;
      }
    }
  });

  return { tookDamage, newHealth };
}    

export function handleFoodCollision(
  x: number,
  y: number,
  foodList: any[] = [],
  player: Player,
  exchangeGameRoomData: (msg: string) => void,
  setFood: (newFood: any[]) => void,
  updatedPlayer: Player,
  updateRoomIfHost: any
) {
  if (!foodList || foodList.length === 0) return;

  const updatedFood = [...foodList];
  let newHealth = player.stats.health;
  let newScore = player.score;
  let changed = false;

  updatedFood.forEach((food, index) => {
    if (!food || typeof food.x !== 'number' || typeof food.y !== 'number') return;

    const distance = Math.hypot(x - food.x, y - food.y);
    const collisionThreshold = (player.size + food.size) / 2;

    if (distance < collisionThreshold) {
      const newFood = generateFood(ARENA_SIZE);
      updatedFood[index] = newFood;

      newHealth = Math.min(newHealth + FOOD_VALUE_HEATH, player.stats.maxHealth);
      newScore += FOOD_VALUE_SCORE;
      changed = true;

      updateRoomIfHost?.((room: GameRoom) => ({
        ...room,
        food: room.food.map((f, i) => (i === index ? newFood : f))
      }));

      exchangeGameRoomData(JSON.stringify({
        type: 'food_update',
        index,
        newFood,
      }));
    }
  });

  if (changed) {
    setFood(updatedFood);
    updatedPlayer.stats.health = newHealth;
    updatedPlayer.score = newScore;

    const now = Date.now();

    updateRoomIfHost?.((room: GameRoom) => ({
      ...room,
      players: room.players.map(p =>
        p.uid === player.uid ? { ...p, stats: { ...p.stats, health: newHealth } } : p
      )
    }));

    exchangeGameRoomData(JSON.stringify({
      type: 'player_health',
      uid: player.uid,
      health: newHealth,
      lastUpdate: now,
    }));

    exchangeGameRoomData(JSON.stringify({
      type: 'player_score',
      uid: player.uid,
      score: newScore,
      lastUpdate: now,
    }));
  }
}