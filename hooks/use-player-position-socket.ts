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

  useEffect(() => {
    if (!player?.uid || !roomKey) return;

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

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [player?.uid, roomKey]);

  function sendPosition(pos: Position) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'position', x: pos.x, y: pos.y }));
  }

  return { sendPosition };
}
