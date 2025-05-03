import { useEffect, useRef } from 'react';

type Position = { x: number; y: number };
type Player = { uid: string };
type PlayerUpdate = { uid: string; x: number; y: number };

export function usePlayerPositionSocket(
  player: Player,
  roomKey: string,
  onOthersUpdate: (update: PlayerUpdate) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const isDisconnected = useRef<boolean>(false);
  const lastSentPosition = useRef<{ x: number; y: number }>({ x: -1, y: -1 }); // posição "inicial inválida"

  useEffect(() => {
    if (!player?.uid || !roomKey) return;
    if (wsRef.current) return; // Já existe uma conexão
    
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL as string);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', uid: player.uid, room: roomKey }));
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === 'position') {
          onOthersUpdate(data);
        }
      } catch (e) {
        console.error('Invalid WebSocket message', e);
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket fechado');
      isDisconnected.current = true;
    };

    ws.onerror = (err) => {
      console.error('❌ WebSocket erro:', err);
    };

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [player?.uid, roomKey]);

  function sendPosition(pos: Position) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // ⚠️ Só envia se mudou desde o último envio
    if (pos.x !== lastSentPosition.current.x || pos.y !== lastSentPosition.current.y) {
      lastSentPosition.current = pos;
      wsRef.current.send(JSON.stringify({ type: 'position', x: pos.x, y: pos.y }));
    }
  }

  return { sendPosition, isDisconnected };
}
