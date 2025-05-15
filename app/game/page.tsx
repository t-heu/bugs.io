"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { database, ref, set } from '@/api/firebase';

import CharacterSelection from "@/components/character-selection"
import GameArena from "@/components/game-arena"

import generateRandomWord from "@/utils/generate-random-word"
import { generateInitialFood } from "@/utils/food"
import { generateInitialCactus } from "@/utils/cactus"
import { ARENA_SIZE, FOOD_COUNT, CACTUS_COUNT } from "@/utils/game-constants"
import { 
  handleJoin, 
  handleFullLoadRoom, 
  handleRemovePlayer, 
  handleFoodUpdate,
  handlePlayerPosition,
  handlePlayerHealth,
  handlePlayerKill,
  handlePlayerScore,
  handlePoison,
  handleShield,
  handleSlow,
  handleSpecialAttack,
  handleSpeedBoost
} from '@/utils/game-event-handlers';
import { useWebRTC } from '@/hooks/use-web-rtc';

import { monitorHostConnection, monitorGuestConnection } from "@/utils/monitor-connection"

import insects from "@/insects.json"

export default function Game() {
  const [gameState, setGameState] = useState("selection") // selection, playing, gameOve
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinMode, setJoinMode] = useState<"none" | "host" | "guest">("none");
  const [roomInput, setRoomInput] = useState(""); // para digitar o código da sala

  const score = useRef<number>(0);
  const assassin = useRef<string>('');

  const [isHost, setIsHost] = useState<null | boolean>(null);
  const [player, setPlayer] = useState<any>(null);
  const [gameRoom, setGameRoom] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState('Conecte-se / Crie uma sala');
  const [userId] = useState(() => Math.random().toString(36).slice(2, 8));
  const [hasJoined, setHasJoined] = useState(false);

  const { 
    sendMessage, 
    onMessage, 
    connected, 
    createOffer, 
    disconnectedPeers, 
    isClosed 
  } = useWebRTC(roomInput, isHost, userId, setGameRoom);

  useEffect(() => {
    isHost ? monitorHostConnection(roomInput) : monitorGuestConnection(roomInput, userId);
  }, [roomInput, player?.uid]);

  useEffect(() => {
    onMessage((msg, from) => {
      const data = JSON.parse(msg);
      const type = data?.type;
      
      if (!type) return;
  
      const handlers: Record<string, Function> = {
        join: (data: any, from: any) => handleJoin(data, from, isHost, setGameRoom),
        loadRoom: (data: any) => handleFullLoadRoom(data, setGameRoom),
        player_exit: (data: any) => handleRemovePlayer(data, setGameRoom),
        food_update: (data: any) => handleFoodUpdate(data, setGameRoom),
        player_position: (data: any) => handlePlayerPosition(data, setGameRoom),
        player_health: (data: any) => handlePlayerHealth(data, setGameRoom),
        player_score: (data: any) => handlePlayerScore(data, setGameRoom),
        player_kill: (data: any) => handlePlayerKill(data, setGameRoom),
        poison: (data: any) => handlePoison(data, setGameRoom),
        shield: (data: any) => handleShield(data, setGameRoom),
        slow: (data: any) => handleSlow(data, setGameRoom),
        special_attack: (data: any) => handleSpecialAttack(data, setGameRoom),
        speed: (data: any) => handleSpeedBoost(data, setGameRoom)
      };
  
      if (handlers[type]) {
        handlers[type](data, from);
      }
    });
  }, [onMessage, isHost]);

  useEffect(() => {
    if (!isHost || !gameRoom) return;

    sendMessage(JSON.stringify({
      type: "loadRoom",
      ...gameRoom,
    }));
  }, [gameRoom]); // dispara sempre que o gameRoom muda

  useEffect(() => {
    if (isClosed) {
      setConnectionStatus('Esperando...');
      setHasJoined(false);
      handleGameOver(0, 'Conexão fechada com host!');
    }
  }, [isClosed]);

  useEffect(() => {
    if (hasJoined) return;

    if (isHost && gameRoom) {
      setConnectionStatus('Conectado!');
      setGameState('playing');
      setHasJoined(true);
    } else if (!isHost && connected && player) {
      sendMessage(JSON.stringify({ type: 'join', player }));
      setConnectionStatus('Conectado!');
      setGameState('playing');
      setHasJoined(true);
    }
  }, [connected, isHost, player, gameRoom, sendMessage, hasJoined]);

  function isValidName(name: string): boolean {
    return !!name && /^[a-zA-Z\s]*$/.test(name);
  }

  async function createHost(character: any) {
    if (!isValidName(name)) return alert('Nome inválido');

    try {
      setLoading(true);
      const playerData = createPlayer(name, character, 0);
      const roomKey = createGame(name, playerData);

      if(!roomKey) return;

      await set(ref(database, `bugsio/rooms/${roomKey}`), {
        timestamp: Date.now()
      });
      
      setPlayer(playerData);
      setRoomInput(roomKey)

      setIsHost(true);
      setConnectionStatus(`Aguardando convidados... em: ${roomKey}`);
    } catch (error) {
      setLoading(false);
      setConnectionStatus((error as Error).message);
    }
  }
  
  async function joinRoom(character: any) {
    if (!isValidName(name)) return alert('Nome inválido');
    if (!roomInput.trim()) return alert('Insira o código da sala');

    try {
      setLoading(true);

      const playerData = createPlayer(name, character, 0);
      setPlayer(playerData);      

      setIsHost(false);
      setConnectionStatus('Conectando ao host...');
      await createOffer();
    } catch (error) {
      setLoading(false);
      setConnectionStatus((error as Error).message);
    }
  }

  function createPlayer(name: string, character: any, score: number) {
    const margin = 50;
    return {
      name,
      uid: userId,
      killer: '',
      size: 30,
      score,
      position: {
        x: Math.random() * (ARENA_SIZE - 2 * margin) + margin,
        y: Math.random() * (ARENA_SIZE - 2 * margin) + margin,
      },
      stats: {
        speed: character.stats.speed * 0.5,
        attack: character.stats.attack,
        health: character.stats.health,
        maxHealth: character.stats.health,
      },
      effects: {
        shieldExpiresAt: 0,
        speedExpiresAt: 0,
        specialAttackExpiresAt: 0,
        slowExpiresAt: 0,
        poisonedExpiresAt: 0
      },
      type: character.id,
      ability: character.ability || null,
      lastUpdate: Date.now(),
    };
  }
  
  function createGame(name: string, playerData: any) {
    const roomKey = generateRandomWord(6);
    setGameRoom({
      gameInProgress: false,
      createdAt: Date.now(),
      food: generateInitialFood(FOOD_COUNT, ARENA_SIZE),
      cactus: generateInitialCactus(CACTUS_COUNT, ARENA_SIZE),
      players: [playerData],
      roomId: roomKey,
      host: name,
    });
    return roomKey;
  }

  const handleGameOver = (finalScore: number, messageEndGame: string) => {
    setGameState("gameOver")
    setLoading(false)
    score.current = finalScore
    assassin.current = messageEndGame
  }

  const restartGame = () => {
    setGameState("selection")
    setLoading(false)
    setJoinMode(isHost ? "host" : "guest")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-950 text-white">
      {gameState === "selection" && (
        <div className="p-4">
          <Link href="/">
            <button className="flex items-center text-green-300 hover:text-white hover:bg-green-800 rounded-md px-4 py-2 w-fit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </button>
          </Link>

          {joinMode === "none" && (
            <div className="p-4 max-w-xl mx-auto flex flex-col gap-6">
              <div className="flex flex-col gap-4 text-center">
                <h2 className="text-2xl font-semibold">Como deseja jogar?</h2>
                <button onClick={() => setJoinMode("host")} className="bg-green-600 hover:bg-green-500 text-[#111] font-medium py-2 px-4 rounded-md">
                  Criar Sala
                </button>
                <button onClick={() => setJoinMode("guest")} className="border border-green-500 hover:bg-green-500 hover:text-[#111] text-green-300 py-2 px-4 rounded-md">
                  Entrar em Sala
                </button>
              </div>
            </div>
          )}

          {joinMode === "guest" && (
            <div className="flex flex-col items-center gap-2">
              <label htmlFor="roomKey" className="text-sm text-gray-300">Digite o código da sala</label>
              <input 
                id="roomKey"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="EX: ABC123"
                className="border border-green-500 w-full px-4 py-2 rounded-md text-green-300 mb-4 bg-[#111] placeholder-green-300"
              />
            </div>
          )}

          {(joinMode === "host" || joinMode === "guest") && (
            <>
              <p className="text-center px-4 py-2 rounded-md text-green-300 mb-4 bg-[#111]">
                 Status: {connectionStatus}
              </p>
              <CharacterSelection 
                characters={insects} 
                name={name} 
                onName={setName} 
                onSelect={(character: any) => {
                  if (!connected && joinMode === "host") {
                    createHost(character);
                  } else if (!connected && joinMode === "guest") {
                    joinRoom(character);
                  } else if (connected && joinMode === "guest") {
                    const newPlayer = createPlayer(name, character, player.score);
                    setGameRoom((prev: any) => {
                      if (!prev) return prev;

                      // Remove o jogador antigo com o mesmo UID, se existir
                      const filteredPlayers = prev.players.filter((p: any) => p.uid !== newPlayer.uid);

                      const updatedGame = {
                        ...prev,
                        players: [...filteredPlayers, newPlayer],
                      };

                      return updatedGame;
                    });
                    setPlayer(newPlayer)
                    // Envia a mensagem para o host
                    sendMessage(JSON.stringify({ type: 'join', player: newPlayer }));
                    setGameState("playing");
                  } else if (connected && joinMode === "host") {
                    const newPlayer = createPlayer(name, character, player.score);
                    setPlayer(newPlayer)
                    setGameState("playing");
                  }
                }} 
                score={score.current} 
                loading={loading}
              />
            </>
          )}
        </div>
      )}

      {gameState === "playing" && player && roomInput && gameRoom && (
        <GameArena
          onGameOver={handleGameOver}
          roomKey={roomInput}
          player={player}
          setPlayer={setPlayer}
          gameRoom={gameRoom}
          broadcast={sendMessage}
          disconnectedPeers={disconnectedPeers}
        />
      )}

      {gameState === "gameOver" && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-green-900/70 p-8 rounded-lg max-w-md w-full text-center">
            <h2 className="text-3xl font-bold mb-4">Fim de Jogo</h2>
            <p className="text-xl mb-6">{assassin.current ? assassin.current : 'Você saiu!'}</p>
            <p className="text-xl mb-6">Sua pontuação: {score.current}</p>

            <div className="space-y-4">
              <button onClick={restartGame} className="mb-2 w-full border-2 text-[#111] border-green-600 bg-green-600 hover:bg-green-500 py-2 px-4 rounded-md text-lg font-medium">
                Jogar Novamente
              </button>

              <Link href="/">
                <button className="w-full border-2 border-green-500 text-green-300 hover:bg-green-500 text-lg font-medium py-2 px-4 rounded-md hover:text-[#111]">
                  Menu Principal
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
