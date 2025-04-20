import { database, ref, update, onDisconnect, remove, onValue } from "@/api/firebase"

export function monitorConnectionStatus(roomCode: string, playerKey: string) {
  const playerRef = ref(database, `bugsio/rooms/${roomCode}/players/p${playerKey}`);
  const connectedRef = ref(database, '.info/connected');
  // Atualizar o status de conexão do jogador quando ele se desconectar
  onDisconnect(playerRef).remove()

  // Monitorar o status de conexão do jogador
  onValue(connectedRef, () => {
    remove(ref(database, `bugsio/rooms/${roomCode}/p${playerKey}`));
  });
}

export function exitPlayer(roomCode: string, playerKey: string) {
  const updates: any = {};
  updates[`bugsio/rooms/${roomCode}/players/p${playerKey}`] = null;
  update(ref(database), updates);
}
