import { Dispatch, SetStateAction } from 'react';

import { generateFood } from "@/utils/food"
import { ARENA_SIZE, FOOD_VALUE_HEATH, FOOD_VALUE_SCORE } from "@/utils/game-constants"
import { Player, GameRoom } from '@/app/interfaces';

export function handlePlayerAttack(
  player: Player,
  otherPlayers: any[],
  lastPoisonTickRef: any,
  exchangeGameRoomData: any,
  updatedPlayer: any,
  updateRoomIfHost: any
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
    const isSpecialAttackActive = player.effects.specialAttackExpiresAt > Date.now();
    const multiplier = isSpecialAttackActive ? player.ability.damageMultiplier : 1.5;
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

    if (player.effects.poisonedExpiresAt && player.effects.poisonedExpiresAt > Date.now()) {
      exchangeGameRoomData(JSON.stringify({
        type: 'Poison',
        uid: player.uid,
        duration: Date.now() + player.ability.duration,
        lastUpdate: Date.now()
      }));

      lastPoisonTickRef.current[targetPlayer.uid] = Date.now();
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

export function applySlowToTargets(
  now: number,
  otherPlayers: Player[],
  player: Player,
  lastSlowTickRef: any,
  setOtherPlayers: Dispatch<SetStateAction<any[]>>,
  exchangeGameRoomData: any
) {
  otherPlayers.forEach((target: Player) => {
    //const isSlowed = target.effects?.slowExpiresAt && target.effects.slowExpiresAt > now;
    const lastTick = lastSlowTickRef.current[target.uid] || 0;
    const tickElapsed = now - lastTick > 500; // reaplica a cada 0.5s se necessário

    if (!tickElapsed) return;

    const slowAmount = player.ability.slowAmount || 0.5;

    setOtherPlayers((prev) =>
      prev.map((p) =>
        p.uid === target.uid
          ? {
              ...p,
              stats: {
                ...p.stats,
                speed: Math.max(1, Math.floor((p.baseSpeed || p.stats.speed / slowAmount) * slowAmount)) // mantém slow ativo
              }
            }
          : p
      )
    );

    exchangeGameRoomData(JSON.stringify({
      type: 'Slow Strike',
      uid: target.uid,
      newSpeed: Math.floor((target.stats.speed || target.stats.speed / slowAmount) * slowAmount),
      duration: Date.now() + player.ability.duration,
      lastUpdate: Date.now()
    }));

    lastSlowTickRef.current[target.uid] = now;
  });
}

export function applyPoisonDamageToTargets( 
  now: any, 
  otherPlayers: Player[], 
  player: Player,
  lastPoisonTickRef: any,
  setOtherPlayers: Dispatch<SetStateAction<any[]>>,
  exchangeGameRoomData: any
) {
  otherPlayers.forEach((target: Player) => {
    const isPoisoned = target.effects?.poisonedExpiresAt && target.effects.poisonedExpiresAt > now;
    const lastTick = lastPoisonTickRef.current[target.uid] || 0;
    const tickElapsed = now - lastTick > 1000;

    if (!isPoisoned || !tickElapsed) return;

    let poisonDamage = player.ability.poisonDamage || 0;

    const bonus = player.ability?.specialBonusDamage;
    if (bonus && bonus.target === target.uid && bonus.bonusDamage !== undefined) {
      poisonDamage += bonus.bonusDamage || 0;
    }

    const newHealth = Math.max(0, target.stats.health - poisonDamage);

    exchangeGameRoomData(JSON.stringify({
      type: 'player_health',
      uid: target.uid,
      health: newHealth,
      lastUpdate: Date.now()
    }));

    setOtherPlayers((prev) =>
      prev.map((p) =>
        p.uid === target.uid
          ? { ...p, stats: { ...p.stats, health: newHealth } }
          : p
      )
    );

    lastPoisonTickRef.current[target.uid] = now;
  });
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
