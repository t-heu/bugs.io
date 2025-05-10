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

export function handleJoin(data: any, from: any, isHost: boolean | null, setGameRoom: any, sendMessage: any) {
  if (!isHost || !data.player) return;

  setGameRoom((prev: any) => {
    if (!prev) return prev;

    // Remove o jogador antigo com o mesmo UID, se existir
    const filteredPlayers = prev.players.filter((p: any) => p.uid !== data.player.uid);

    const updatedGame = {
      ...prev,
      players: [...filteredPlayers, data.player],
    };

    sendMessage(JSON.stringify({ type: 'loadRoom', ...updatedGame }));
    return updatedGame;
  });
}

export function handleFullLoadRoom(data: any, setGameRoom: any) {
  //console.log(data)
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
