import { useEffect, useRef, useState } from 'react';
import { database, ref, onChildAdded, push, set, get, update } from '@/api/firebase';

const servers = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export function useWebRTC(roomKey: string, isHost: boolean | null, uid: string) {
  const connections = useRef<{ [id: string]: RTCPeerConnection }>({});
  const dataChannels = useRef<{ [id: string]: RTCDataChannel }>({});
  const onMessageCallback = useRef<(msg: string, from: string) => void>(() => {});
  const [connected, setConnected] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [disconnectedPeers, setDisconnectedPeers] = useState<string | null>(null);

  const handleDisconnect = (peerId: string) => {
    setDisconnectedPeers(peerId)
  };

  const setupPeerConnection = (
    pc: RTCPeerConnection,
    remoteId: string,
    isHostPeer: boolean,
    remoteOffer?: RTCSessionDescriptionInit
  ) => {
    // Adiciona o evento de mudança de estado de conexão ICE
    pc.oniceconnectionstatechange = (event) => {
      const state = pc.iceConnectionState;
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        handleDisconnect(remoteId);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const targetPath = isHostPeer
          ? `bugsio/rooms/${roomKey}/answers/${remoteId}/candidates`
          : `bugsio/rooms/${roomKey}/offers/${uid}/candidates`;

        push(ref(database, targetPath), event.candidate.toJSON());
      }
    };

    if (isHostPeer) {
      pc.ondatachannel = (event) => {
        const channel = event.channel;
        dataChannels.current[remoteId] = channel;

        channel.onopen = () => {
          console.log('[HOST] Canal aberto com', remoteId);
          setConnected(true);
        };

        channel.onmessage = (e) => {
          const msg = e.data;
          const senderId = remoteId;
        
          // Chama o callback do próprio host (útil para logs ou lógica de jogo)
          onMessageCallback.current(msg, senderId);
        
          // Retransmite a mensagem para todos os outros convidados
          Object.entries(dataChannels.current).forEach(([id, ch]) => {
            if (id !== senderId && ch.readyState === 'open') {
              ch.send(msg);
            }
          });
        };        
      }
    }

    if (remoteOffer) {
      pc.setRemoteDescription(new RTCSessionDescription(remoteOffer)).then(async () => {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await set(ref(database, `bugsio/rooms/${roomKey}/answers/${remoteId}/answer`), answer);
      });
    }

    // Adiciona candidatos ICE
    const candidatesPath = isHostPeer
      ? `bugsio/rooms/${roomKey}/offers/${remoteId}/candidates`
      : `bugsio/rooms/${roomKey}/answers/${remoteId}/candidates`;

    onChildAdded(ref(database, candidatesPath), (snap) => {
      const candidate = new RTCIceCandidate(snap.val());
      pc.addIceCandidate(candidate);
    });
  };

  const createOffer = async () => {
    try {
      const roomRef = ref(database, `bugsio/rooms/${roomKey}`);
      const snap = await get(roomRef);

      if (!snap.exists()) {
        throw new Error(`Sala não encontrada: ${roomKey}`);
      }

      const pc = new RTCPeerConnection(servers);
      const channel = pc.createDataChannel('data');
      connections.current['host'] = pc;
      dataChannels.current['host'] = channel;

      channel.onopen = () => {
        console.log('[GUEST] Canal aberto com host');
        setConnected(true);
      };

      channel.onmessage = (e) => {
        onMessageCallback.current(e.data, 'host');
      };

      channel.onclose = () => {
        console.log('[GUEST] Canal com host fechado');
        setIsClosed(true);
        setConnected(false);

        if (pc && pc.signalingState !== 'closed') {
          pc.close();
        }

        handleDisconnect('host');
      };

      setupPeerConnection(pc, 'host', false);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await update(ref(database, `bugsio/rooms/${roomKey}/offers/${uid}`), { offer });

      const answerRef = ref(database, `bugsio/rooms/${roomKey}/answers/${uid}/answer`);
      const checkAnswer = async () => {
        const snap = await get(answerRef);
        if (snap.exists()) {
          const answer = snap.val();
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } else {
          setTimeout(checkAnswer, 1000);
        }
      };
      checkAnswer();
    } catch (err) {
      //console.error('[createOffer] Erro ao criar oferta:', err);
      throw err; // Repropaga o erro se você quiser tratar ele mais acima
    }
  };

  useEffect(() => {
    if (!roomKey || isHost === null || !uid) return;

    if (isHost) {
      console.log('[HOST] Escutando ofertas...');
      onChildAdded(ref(database, `bugsio/rooms/${roomKey}/offers`), async (snap) => {
        const guestId = snap.key!;
        if (guestId === uid) return; // ignora ofertas do próprio host (caso ocorra)

        const { offer } = snap.val();
        if (!offer) return;

        const pc = new RTCPeerConnection(servers);
        connections.current[guestId] = pc;

        setupPeerConnection(pc, guestId, true, offer);
      });
    }
  }, [roomKey, isHost, uid]);

  const sendMessage = (msg: string) => {
    Object.entries(dataChannels.current).forEach(([id, channel]) => {
      if (channel.readyState === 'open') {
        channel.send(msg);
      }
    });
  };

  const onMessage = (cb: (msg: string, from: string) => void) => {
    onMessageCallback.current = cb;
  };

  return { sendMessage, onMessage, connected, createOffer, disconnectedPeers, isClosed };
}
