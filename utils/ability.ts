export function specialAttack(activeEffectsRef: any, roomKey: string, player: any, sendToRoom: any) {
  const now = Date.now();

  const specialAttackUntil = now + player.ability.duration;

  activeEffectsRef.current["SpecialAttack"] = specialAttackUntil;

  sendToRoom(JSON.stringify({
    type: 'player_update',
    uid: player.uid,
    lastUpdate: Date.now(),
    updates: {
      effects: {
        specialAttack: specialAttackUntil,
      },
    },
  }));
}

export function activateShield(activeEffectsRef: any, roomKey: string, player: any, sendToRoom: any) {
  const now = Date.now();
  const invincibleUntil = now + player.ability.duration;

  activeEffectsRef.current["invincible"] = invincibleUntil;

   sendToRoom(JSON.stringify({
    type: 'player_update',
    uid: player.uid,
    updates: {
      effects: {
        invincible: invincibleUntil,
      },
    },
    lastUpdate: Date.now()
  }));
}

export function activateSpeedBoost(activeEffectsRef: any, roomKey: string, player: any, sendToRoom: any) {
  const now = Date.now();

  const speedBoostUntil = now + player.ability.duration;

  activeEffectsRef.current["speedBoost"] = speedBoostUntil;

  sendToRoom(JSON.stringify({
    type: 'player_update',
    uid: player.uid,
    updates: {
      effects: {
        speedBoost: speedBoostUntil,
      },
    },
    lastUpdate: Date.now()
  }));
}

export function healPlayer(roomKey: string, player: any, setPlayer: any, sendToRoom: any) {
  const healAmount = player.ability.healAmount;
  const newHealth = Math.min(player.stats.health + healAmount, player.stats.maxHealth);

  setPlayer((prev: any) => ({
    ...prev,
    stats: {
      ...prev.stats,
      health: newHealth,
    },
  }));

  sendToRoom(JSON.stringify({
    type: 'player_update',
    uid: player.uid,
    updates: {
      stats: {
        health: newHealth,
      },
    },
    lastUpdate: Date.now()
  }));
}

export function applyPoisonEffect(playerUid: string, roomKey: string, sendToRoom: any) {
  sendToRoom(JSON.stringify({
    type: 'player_update',
    uid: playerUid,
    updates: {
      poisonNextAttack: true,
    },
    lastUpdate: Date.now()
  }));
}

export function applySlow(activeEffectsRef: any, roomKey: string, player: any, sendToRoom: any) {
  const now = Date.now();

  const slowUntil = now + player.ability.duration;

  activeEffectsRef.current["slow"] = slowUntil;

  sendToRoom(JSON.stringify({
    type: 'player_update',
    uid: player.uid,
    updates: {
      effects: {
        slow: slowUntil,
      },
    },
    lastUpdate: Date.now()
  }));
}
