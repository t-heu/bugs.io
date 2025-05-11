import { Dispatch, SetStateAction } from 'react';

import { generateFood } from "@/utils/food"
import { ARENA_SIZE, FOOD_VALUE_HEATH, FOOD_VALUE_SCORE } from "@/utils/game-constants"
import { Player } from '@/app/interfaces';

export function handlePlayerAttack(
  player: Player,
  otherPlayers: any[],
  lastPoisonTickRef: any,
  broadcast: any,
  updatedPlayer: any
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
    
    broadcast(JSON.stringify({
      type: 'player_health',
      uid: targetPlayer.uid,
      health: newHealthTarget,
      lastUpdate: Date.now()
    }));

    if (player.effects.poisonedExpiresAt && player.effects.poisonedExpiresAt > Date.now()) {
      broadcast(JSON.stringify({
        type: 'poison',
        uid: player.uid,
        duration: Date.now() + player.ability.duration,
        lastUpdate: Date.now()
      }));

      lastPoisonTickRef.current[targetPlayer.uid] = Date.now();
    }

    if (targetPlayer.name && newHealthTarget === 0) {
      updatedPlayer.killer = `${player.name} - (${player.type})`;

      broadcast(JSON.stringify({
        type: 'player_kill',
        uid: targetPlayer.uid,
        killer: `${player.name} - (${player.type})`,
        lastUpdate: Date.now()
      }));

      const newScore = player.score + 15;
      updatedPlayer.score = newScore

      broadcast(JSON.stringify({
        type: 'player_score',
        uid: player.uid,
        score: newScore,
        lastUpdate: Date.now()
      }));
    }
    console.log(targetPlayer.position)
  });
}

export function applyPoisonDamageToTargets(
  nowEffect: any, 
  now: any, 
  otherPlayers: Player[], 
  player: Player,
  lastPoisonTickRef: any,
  setOtherPlayers: Dispatch<SetStateAction<any[]>>,
  broadcast: any
) {
  otherPlayers.forEach((target: Player) => {
    const isPoisoned = target.effects.poisonedExpiresAt && target.effects.poisonedExpiresAt > now;
    const lastTick = lastPoisonTickRef.current[target.uid] || 0;
    const tickElapsed = now - lastTick > 1000;

    if (!isPoisoned || !tickElapsed) return;

    let poisonDamage = player.ability.poisonDamage || 0;

    const bonus = player.ability?.specialBonusDamage;
    if (bonus && bonus.target === target.uid && bonus.bonusDamage !== undefined) {
      poisonDamage += bonus.bonusDamage || 0;
    }

    const newHealth = Math.max(0, target.stats.health - poisonDamage);

    broadcast(JSON.stringify({
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

    lastPoisonTickRef.current[target.uid] = nowEffect;
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
  foodList: any[] = [],  // Valor padrão para foodList
  player: Player,
  broadcast: (msg: string) => void,
  setFood: (newFood: any[]) => void,
  updatedPlayer: any
) {
  if (!foodList || foodList.length === 0) {
    return; // Caso a lista de comida seja indefinida ou vazia
  }

  const updatedFood = [...foodList];
  let newHealth_food = player.stats.health;
  let newScore_food = player.score;
  let changed = false;

  updatedFood.forEach((food, index) => {
    if (!food || typeof food.x !== 'number' || typeof food.y !== 'number') {
      return; // Verifica se o item de comida é válido
    }

    const distance = Math.hypot(x - food.x, y - food.y);
    const collisionThreshold = (player.size + food.size) / 2;

    if (distance < collisionThreshold) {
      const newFood = generateFood(ARENA_SIZE); // Suponho que essa função gere uma nova comida
      updatedFood[index] = newFood;
      newHealth_food = Math.min(player.stats.health + FOOD_VALUE_HEATH, player.stats.maxHealth);
      newScore_food = player.score + FOOD_VALUE_SCORE;
      changed = true;

      // Envia comida atualizada para todos os jogadores
      broadcast(JSON.stringify({
        type: 'food_update',
        index,
        newFood,
      }));
    }
  });

  if (changed) {
    // Atualiza o estado local da comida para o jogador atual
    setFood(updatedFood);

    updatedPlayer.stats.health = newHealth_food
    updatedPlayer.score = newScore_food

    // Atualiza vida e score do jogador
    const now = Date.now();

    broadcast(JSON.stringify({
      type: 'player_health',
      uid: player.uid,
      health: newHealth_food,
      lastUpdate: now
    }));

    broadcast(JSON.stringify({
      type: 'player_score',
      uid: player.uid,
      score: newScore_food,
      lastUpdate: now
    }));
  }
}
