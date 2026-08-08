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
  const poisonCarrierExpiresAt = now + player.ability.duration;

  // Isso é um buff LOCAL: "meus próximos ataques envenenam quem eu acertar".
  // Não pode ser transmitido como evento 'Poison' com o uid de quem ativou —
  // esse tipo de evento marca o ALVO como envenenado (dano ao longo do tempo).
  // Se transmitíssemos com o próprio uid, o jogador tomaria dano do seu
  // próprio veneno assim que outro cliente processasse a mensagem.
  // O efeito real é aplicado ao alvo em handlePlayerAttack, no momento do acerto.
  activeEffectsRef.current["Poison"] = poisonCarrierExpiresAt;
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