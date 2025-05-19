import { Player, GameRoom } from "@/app/interfaces"

export function handleRemovePlayer(data: any, setGameRoom: any) {
  setGameRoom((prev: any) => {
    if (!prev) return prev;
    
    const updatedPlayers = prev.players.filter((p: any) => p.uid !== data.uid);
    
    return {
      ...prev,
      players: updatedPlayers, // Atualiza a lista de jogadores com o jogador removido
    };
  });
}

export function handleJoin(data: any, from: any, isHost: boolean | null, setGameRoom: any) {
  if (!isHost || !data.player) return;

  setGameRoom((prev: any) => {
    if (!prev) return prev;

    // Remove jogador antigo com o mesmo UID
    const filteredPlayers = prev.players.filter((p: any) => p.uid !== data.player.uid);
    const updatedPlayers = [...filteredPlayers, data.player];

    return {
      ...prev,
      players: updatedPlayers,
    };
  });
}

export function handleFullLoadRoom(data: any, setGameRoom: any) {
  if (!data) return 
  setGameRoom(data);
}

export function handleFoodUpdate(data: any, setGameRoom: any) {
  if (data.index == null || !data.newFood) return;

  setGameRoom((prev: any) => {
    if (!prev) return prev;

    const updatedFood = [...prev.food];
    updatedFood[data.index] = data.food;

    return {
      ...prev,
      food: updatedFood,
    };
  });
}

function mergePlayerByUid(
  uid: string,
  updater: (p: Player) => Player,
  setGameRoom: any
) {
  setGameRoom((prev: GameRoom | null) => {
    if (!prev) return prev;

    return {
      ...prev,
      players: prev.players.map(p => {
        if (p.uid !== uid) return p;
        return updater(p);
      }),
    };
  });
}

export function handlePlayerPosition(data: any, setGameRoom: any) {
  if (!data.uid || !data.position) return;
  
  mergePlayerByUid(data.uid, (p) => ({
    ...p,
    position: {
      ...p.position,
      ...data.position,
    },
    lastUpdate: data.lastUpdate ?? Date.now(),
  }), setGameRoom);
}

export function handlePlayerHealth(data: any, setGameRoom: any) {
  if (!data.uid || typeof data.health !== 'number') return;

  mergePlayerByUid(data.uid, (p) => {
    const newHealth = Math.max(0, data.health);
    return {
      ...p,
      stats: { ...p.stats, health: newHealth },
      lastUpdate: data.lastUpdate ?? Date.now(),
    };
  }, setGameRoom);
}

export function handlePlayerScore(data: any, setGameRoom: any) {
  if (!data.uid || typeof data.score !== 'number') return;

  mergePlayerByUid(data.uid, (p) => ({
    ...p,
    score: data.score ?? p.score,
    lastUpdate: data.lastUpdate ?? Date.now(),
  }), setGameRoom);
}

export function handlePlayerKill(data: any, setGameRoom: any) {
  const { uid, killer } = data;
  if (!uid || !killer) return;

  mergePlayerByUid(uid, (p) => ({
    ...p,
    killer,
    lastUpdate: data.lastUpdate ?? Date.now(),
  }), setGameRoom);
}

// Handlers Effects
function applyEffectUntil(
  uid: string,
  effectKey: string,
  duration: number,
  activeEffectsRef: any,
  setGameRoom: any
) {
  const now = Date.now();
  const until = now + duration;

  // Atualiza efeito local
  activeEffectsRef.current[effectKey] = until;

  // Atualiza no estado global
  mergePlayerByUid(uid, (p) => ({
    ...p,
    effects: {
      ...p.effects,
      [effectKey]: until,
    },
    lastUpdate: now,
  }), setGameRoom);
}

export function handleSpecialAttack(data: any, setGameRoom: any) {
  const { uid, duration } = data;
  if (!uid || typeof duration !== 'number') return;

  applyEffectUntil(uid, "specialAttackExpiresAt", duration, { current: {} }, setGameRoom);
}

export function handleShield(data: any, setGameRoom: any) {
  const { uid, duration } = data;
  if (!uid || typeof duration !== 'number') return;

  applyEffectUntil(uid, "shieldExpiresAt", duration, { current: {} }, setGameRoom);
}

export function handleSpeedBoost(data: any, setGameRoom: any) {
  const { uid, duration } = data;
  if (!uid || typeof duration !== 'number') return;

  applyEffectUntil(uid, "speedExpiresAt", duration, { current: {} }, setGameRoom);
}

export function handleSlow(data: any, setGameRoom: any) {
  const { uid, newSpeed, duration } = data;
  if (!uid || !newSpeed || typeof duration !== 'number') return;
  
  mergePlayerByUid(uid, (p) => ({
    ...p,
    stats: { ...p.stats, speed: newSpeed },
    lastUpdate: data.lastUpdate ?? Date.now(),
  }), setGameRoom);
}

export function handlePoison(data: any, setGameRoom: any) {
  const { uid, duration } = data;
  if (!uid || typeof duration !== 'number') return;

  applyEffectUntil(uid, "poisonedExpiresAt", duration, { current: {} }, setGameRoom);
}
