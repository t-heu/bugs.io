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

export function exitPlayer(roomCode: string, playerKey: string) {
  const updates: any = {};
  updates[`bugsio/rooms/${roomCode}`] = null;
  update(ref(database), updates);
}
