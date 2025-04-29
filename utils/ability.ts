import { database, ref, update } from "@/api/firebase"

export function specialAttack(activeEffectsRef: any, roomKey: string, player: any) {
  const now = Date.now();

  const specialAttackUntil = now + player.ability.duration;

  activeEffectsRef.current["SpecialAttack"] = specialAttackUntil;

  update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}/effects`), {
    specialAttack: specialAttackUntil,
  });
}

export function activateShield(activeEffectsRef: any, roomKey: string, player: any) {
  const now = Date.now();
  const invincibleUntil = now + player.ability.duration;

  activeEffectsRef.current["invincible"] = invincibleUntil;

  update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}/effects`), {
    invincible: invincibleUntil,
  });
}

export function activateSpeedBoost(activeEffectsRef: any, roomKey: string, player: any) {
  const now = Date.now();

  const speedBoostUntil = now + player.ability.duration; // 4 segundos de invencibilidade

  activeEffectsRef.current["speedBoost"] = speedBoostUntil;

  update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}/effects`), {
    speedBoost: speedBoostUntil,
  });
}

export function healPlayer(roomKey: string, player: any, setPlayer: any) {
  const healAmount = player.ability.healAmount;
  const newHealth = Math.min(player.stats.health + healAmount, player.stats.maxHealth);

  setPlayer((prev: any) => ({
    ...prev,
    stats: {
      ...prev.stats,
      health: newHealth,
    },
  }));

  update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}/stats`), {
    health: newHealth,
  });
}

export function applyPoisonEffect(playerUid: string, roomKey: string) {
  update(ref(database, `bugsio/rooms/${roomKey}/players/p${playerUid}`), {
    poisonNextAttack: true,
  });
}

export function applySlow(playerUid: string, roomKey: string) {
  update(ref(database, `bugsio/rooms/${roomKey}/players/p${playerUid}`), {
    poisonNextAttack: true,
  });
}
