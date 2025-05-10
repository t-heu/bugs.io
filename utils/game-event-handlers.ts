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

export function handlePlayerUpdate(data: any, setGameRoom: any, sendMessage: any, localUid: string) {
  if (!data.uid || !data.updates) return;
  console.log('[PLAYER_UPDATE]', data);

  setGameRoom((prev: GameRoom | null) => {
    if (!prev) return prev;

    const updatedPlayers = prev.players.map((p: Player) => {
      if (p.uid !== data.uid) return p;

      const isNewer = (data.lastUpdate ?? 0) > (p.lastUpdate ?? 0);
      if (!isNewer) return p;

      const updatedStats = {
        ...p.stats,
        ...(data.updates.stats || {}),
      };

      if (updatedStats.health <= 0) {
        updatedStats.health = 0;
      }
      console.log('aq: ', data.updates)
      const updatedPlayer: Player = {
        ...p,
        lastUpdate: data.lastUpdate ?? Date.now(),
        stats: updatedStats,
        effects: {
          ...p.effects,
          ...(data.updates.effects || {}),
        },
        position: {
          ...p.position,
          ...(data.updates.position || {}),
        },
        ability: data.updates.ability !== undefined ? data.updates.ability : p.ability,
        killer: data.updates.killer !== undefined ? data.updates.killer : p.killer,
        score: data.updates.score !== undefined ? data.updates.score : p.score,
        size: data.updates.size !== undefined ? data.updates.size : p.size,
        poisonNextAttack: data.updates.poisonNextAttack !== undefined
          ? data.updates.poisonNextAttack
          : p.poisonNextAttack,
        type: data.updates.type !== undefined ? data.updates.type : p.type,
        name: data.updates.name !== undefined ? data.updates.name : p.name,
      };

      // ✅ Se esse é o jogador local, reenviar update para os outros
      if (data.uid === localUid) {
        sendMessage(JSON.stringify({
          type: 'player_update',
          uid: localUid,
          updates: data.updates,
          lastUpdate: updatedPlayer.lastUpdate,
        }));
      }

      return updatedPlayer;
    });

    return {
      ...prev,
      players: updatedPlayers,
    };
  });
}
