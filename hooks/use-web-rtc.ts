import { useEffect, useRef, useState } from 'react';
import { onChildAdded, onValue, push, ref, set, get, update, database } from '@/api/firebase';

const MAX_PLAYERS = 6;
const servers = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export function useWebRTC(roomKey: string, isHost: boolean | null, uid: string, setGameRoom: any) {
  const peerConnections = useRef<{ [id: string]: RTCPeerConnection }>({});
  const dataChannels = useRef<{ [id: string]: RTCDataChannel }>({});
  const messageHandlerRef = useRef<(msg: string, from: string) => void>(() => {});

  const [connected, setConnected] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [disconnectedPeers, setDisconnectedPeers] = useState<string | null>(null);

  const handleDisconnect = (peerId: string) => {
    setDisconnectedPeers(peerId);
  };

  useEffect(() => {
    const handleUnload = () => {
      Object.values(peerConnections.current).forEach((pc) => {
        if (pc.signalingState !== 'closed') pc.close();
      });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const setupPeerConnection = (
    pc: RTCPeerConnection,
    remoteId: string,
    isHostPeer: boolean,
    remoteOffer?: RTCSessionDescriptionInit
  ) => {
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (['failed', 'disconnected', 'closed'].includes(state)) {
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

        setupDataChannelHandlers(channel, remoteId);
      };
    }

    if (remoteOffer) {
      pc.setRemoteDescription(new RTCSessionDescription(remoteOffer)).then(async () => {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await set(ref(database, `bugsio/rooms/${roomKey}/answers/${remoteId}/answer`), answer);
      });
    }

    const candidatesPath = isHostPeer
      ? `bugsio/rooms/${roomKey}/offers/${remoteId}/candidates`
      : `bugsio/rooms/${roomKey}/answers/${remoteId}/candidates`;

    onChildAdded(ref(database, candidatesPath), (snap) => {
      const candidate = new RTCIceCandidate(snap.val());
      pc.addIceCandidate(candidate);
    });
  };

  const setupDataChannelHandlers = (channel: RTCDataChannel, peerId: string) => {
    channel.onopen = () => {
      console.log(`[CANAL ABERTO] com ${peerId}`);
      setConnected(true);
      if (peerId === 'host') setIsClosed(false);
    };

    channel.onclose = () => {
      console.log(`[CANAL FECHADO] com ${peerId}`);
      
      if (peerId === 'host') {
        setIsClosed(true)
        setConnected(false);
        handleDisconnect('host');
      } else {
        setGameRoom((prev: any) => {
          if (!prev) return prev;
          return { ...prev, players: prev.players.filter((p: any) => p.uid !== peerId) };
        });
      }
      
      delete dataChannels.current[peerId];
      delete peerConnections.current[peerId];
    };

    channel.onmessage = (e) => {
      const msg = e.data;
      messageHandlerRef.current(msg, peerId);

      if (isHost) {
        Object.entries(dataChannels.current).forEach(([id, ch]) => {
          if (id !== peerId && ch.readyState === 'open') {
            ch.send(msg);
          }
        });
      }
    };
  };

  const validateRoomCapacity = async () => {
    const roomRef = ref(database, `bugsio/rooms/${roomKey}`);
    const snap = await get(roomRef);
    if (!snap.exists()) throw new Error(`Sala não encontrada: ${roomKey}`);

    const roomData = snap.val();
    const players = roomData.offers ? Object.values(roomData.offers) : [];
    if (players.length >= MAX_PLAYERS - 1) {
      throw new Error('Sala cheia. O número máximo de jogadores é 6.');
    }
  };

  const createOffer = async () => {
    try {
      await validateRoomCapacity();

      const pc = new RTCPeerConnection(servers);
      const channel = pc.createDataChannel('data');
      peerConnections.current['host'] = pc;
      dataChannels.current['host'] = channel;

      setupDataChannelHandlers(channel, 'host');
      setupPeerConnection(pc, 'host', false);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await update(ref(database, `bugsio/rooms/${roomKey}/offers/${uid}`), { offer });

      const answerRef = ref(database, `bugsio/rooms/${roomKey}/answers/${uid}/answer`);
      const unsubscribe = onValue(answerRef, async (snap) => {
        if (snap.exists()) {
          const answer = snap.val();
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          unsubscribe();
        }
      });
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (!roomKey || isHost === null || !uid) return;

    if (isHost) {
      onChildAdded(ref(database, `bugsio/rooms/${roomKey}/offers`), async (snap) => {
        const guestId = snap.key!;
        if (guestId === uid) return;

        const { offer } = snap.val();
        if (!offer) return;

        const pc = new RTCPeerConnection(servers);
        peerConnections.current[guestId] = pc;

        setupPeerConnection(pc, guestId, true, offer);
      });
    }
  }, [roomKey, isHost, uid]);

  const sendMessage = (msg: string) => {
    Object.entries(dataChannels.current).forEach(([_, channel]) => {
      if (channel.readyState === 'open') {
        channel.send(msg);
      }
    });
  };

  const onMessage = (cb: (msg: string, from: string) => void) => {
    messageHandlerRef.current = cb;
  };

  return { sendMessage, onMessage, connected, createOffer, disconnectedPeers, isClosed };
}
