export function specialAttack(activeEffectsRef: any, player: any, broadcast: any) {
  const now = Date.now();

  const specialAttackExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["special_attack"] = specialAttackExpiresAt;

  broadcast(JSON.stringify({
    type: 'special_attack',
    uid: player.uid,
    lastUpdate: Date.now(),
    duration: specialAttackExpiresAt,
  }));
}

export function activateShield(activeEffectsRef: any, player: any, broadcast: any) {
  const now = Date.now();
  const shieldExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["shield"] = shieldExpiresAt;

   broadcast(JSON.stringify({
    type: 'shield',
    uid: player.uid,
    duration: shieldExpiresAt,
    lastUpdate: Date.now()
  }));
}

export function activateSpeedBoost(activeEffectsRef: any, player: any, broadcast: any) {
  const now = Date.now();

  const speedExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["speed"] = speedExpiresAt;

  broadcast(JSON.stringify({
    type: 'speed',
    uid: player.uid,
    duration: speedExpiresAt,
    lastUpdate: Date.now()
  }));
}

export function healPlayer(player: any, setPlayer: any, broadcast: any) {
  const healAmount = player.ability.healAmount;
  const newHealth = Math.min(player.stats.health + healAmount, player.stats.maxHealth);

  setPlayer((prev: any) => ({
    ...prev,
    stats: {
      ...prev.stats,
      health: newHealth,
    },
  }));

  broadcast(JSON.stringify({
    type: 'player_health',
    uid: player.uid,
    health: newHealth,
    lastUpdate: Date.now()
  }));
}

export function applyPoisonEffect(activeEffectsRef: any, player: any, broadcast: any) {
  const now = Date.now();

  const poisonedExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["poison"] = poisonedExpiresAt;

  broadcast(JSON.stringify({
    type: 'poison',
    uid: player.uid,
    duration: poisonedExpiresAt,
    lastUpdate: Date.now()
  }));
}

export function applySlow(activeEffectsRef: any, player: any, broadcast: any) {
  const now = Date.now();

  const slowExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["slow"] = slowExpiresAt;

  broadcast(JSON.stringify({
    type: 'slow',
    uid: player.uid,
    duration: slowExpiresAt,
    lastUpdate: Date.now()
  }));
}
