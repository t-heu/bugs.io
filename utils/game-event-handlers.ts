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

    sendMessage(JSON.stringify({ type: 'gameRoom', ...updatedGame }));
    return updatedGame;
  });
}

export function handleFullGameRoom(data: any, setGameRoom: any) {
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

export function handlePlayerUpdate(data: any, setGameRoom: any, sendMessage: any) { 
  if (!data.uid || !data.updates) return;

  setGameRoom((prev: any) => {
    if (!prev) return prev;

    const updatedPlayers = prev.players.map((p: any) => {
      if (p.uid !== data.uid) return p;

      const isNewer = (data.lastUpdate ?? 0) > (p.lastUpdate ?? 0);
      if (!isNewer) return p;

      return {
        ...p,
        ...data.updates,
        lastUpdate: data.lastUpdate ?? Date.now(),
        stats: {
          ...p.stats,
          ...(data.updates.stats || {}),
        },
        effects: {
          ...p.effects,
          ...(data.updates.effects || {}),
        },
        position: {
          ...p.position,
          ...(data.updates.position || {}),
        },
        ability: data.updates.ability !== undefined ? data.updates.ability : p.ability,
      };
    });

    const newRoom = {
      ...prev,
      players: updatedPlayers,
    };

    return newRoom;
  });
}
