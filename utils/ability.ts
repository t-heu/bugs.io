export function specialAttack(activeEffectsRef: any, player: any, exchangeGameRoomData: any) {
  const now = Date.now();

  const specialAttackExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["Special Attack"] = specialAttackExpiresAt;

  exchangeGameRoomData(JSON.stringify({
    type: 'Special Attack',
    uid: player.uid,
    lastUpdate: Date.now(),
    duration: specialAttackExpiresAt,
  }));
}

export function activateShield(activeEffectsRef: any, player: any, exchangeGameRoomData: any) {
  const now = Date.now();
  const shieldExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["Hard Shell"] = shieldExpiresAt;

   exchangeGameRoomData(JSON.stringify({
    type: 'Hard Shell',
    uid: player.uid,
    duration: shieldExpiresAt,
    lastUpdate: Date.now()
  }));
}

export function activateSpeedBoost(activeEffectsRef: any, player: any, exchangeGameRoomData: any) {
  const now = Date.now();

  const speedExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["Speed Boost"] = speedExpiresAt;

  exchangeGameRoomData(JSON.stringify({
    type: 'Speed Boost',
    uid: player.uid,
    duration: speedExpiresAt,
    lastUpdate: Date.now()
  }));
}

export function healPlayer(player: any, setPlayer: any, exchangeGameRoomData: any) {
  const healAmount = player.ability.healAmount;
  const newHealth = Math.min(player.stats.health + healAmount, player.stats.maxHealth);

  setPlayer((prev: any) => ({
    ...prev,
    stats: {
      ...prev.stats,
      health: newHealth,
    },
  }));

  exchangeGameRoomData(JSON.stringify({
    type: 'player_health',
    uid: player.uid,
    health: newHealth,
    lastUpdate: Date.now()
  }));
}

export function applyPoisonEffect(activeEffectsRef: any, player: any, exchangeGameRoomData: any) {
  const now = Date.now();

  const poisonedExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["Poison"] = poisonedExpiresAt;

  exchangeGameRoomData(JSON.stringify({
    type: 'Poison',
    uid: player.uid,
    duration: poisonedExpiresAt,
    lastUpdate: Date.now()
  }));
}

export function applySlow(activeEffectsRef: any, player: any, exchangeGameRoomData: any) {
  const now = Date.now();

  const slowExpiresAt = now + player.ability.duration;

  activeEffectsRef.current["Slow Strike"] = slowExpiresAt;

  exchangeGameRoomData(JSON.stringify({
    type: 'Slow Strike',
    uid: player.uid,
    duration: slowExpiresAt,
    lastUpdate: Date.now()
  }));
}
