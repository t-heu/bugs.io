import { database, ref, update, onDisconnect, set, onValue } from "@/api/firebase"

export function monitorHostConnection(roomCode: string) {
  const roomRef = ref(database, `bugsio/rooms/${roomCode}`);
  const connectedRef = ref(database, '.info/connected');

  onValue(connectedRef, async (snap) => {
    if (snap.val() === true) {
      console.log('[HOST] conectado, agendando remoção da sala se desconectar.');

      // 🔒 Atualiza algo leve só pra garantir que o Firebase registre o onDisconnect
      await set(roomRef, { alive: true, timestamp: Date.now() });

      // 🚨 Só depois do "set" que o onDisconnect é confiável
      onDisconnect(roomRef).remove();
    }
  });
}

export function monitorGuestConnection(roomCode: string, playerKey: string) {
  if (!roomCode) return;

  const playerRef1 = ref(database, `bugsio/rooms/${roomCode}/answers/${playerKey}`);
  const playerRef2 = ref(database, `bugsio/rooms/${roomCode}/offers/${playerKey}`);
  const connectedRef = ref(database, '.info/connected');

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log('[GUEST] conectado, agendando remoção da conexão se desconectar.');

      // Apenas configurar o onDisconnect sem fazer set() nos dados
      onDisconnect(playerRef1).remove();
      onDisconnect(playerRef2).remove();
    }
  });
}
