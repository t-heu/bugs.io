export function specialAttack(activeEffectsRef: any, player: any, broadcast: any) {
  const now = Date.now();

  const specialAttackExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["Special Attack"] = specialAttackExpiresAt;

  broadcast(JSON.stringify({
    type: 'Special Attack',
    uid: player.uid,
    lastUpdate: Date.now(),
    duration: specialAttackExpiresAt,
  }));
}

export function activateShield(activeEffectsRef: any, player: any, broadcast: any) {
  const now = Date.now();
  const shieldExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["Hard Shell"] = shieldExpiresAt;

   broadcast(JSON.stringify({
    type: 'Hard Shell',
    uid: player.uid,
    duration: shieldExpiresAt,
    lastUpdate: Date.now()
  }));
}

export function activateSpeedBoost(activeEffectsRef: any, player: any, broadcast: any) {
  const now = Date.now();

  const speedExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["Speed Boost"] = speedExpiresAt;

  broadcast(JSON.stringify({
    type: 'Speed Boost',
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

  activeEffectsRef.current["Poison"] = poisonedExpiresAt;

  broadcast(JSON.stringify({
    type: 'Poison',
    uid: player.uid,
    duration: poisonedExpiresAt,
    lastUpdate: Date.now()
  }));
}

export function applySlow(activeEffectsRef: any, player: any, broadcast: any) {
  const now = Date.now();

  const slowExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["Slow Strike"] = slowExpiresAt;

  broadcast(JSON.stringify({
    type: 'Slow Strike',
    uid: player.uid,
    duration: slowExpiresAt,
    lastUpdate: Date.now()
  }));
}
