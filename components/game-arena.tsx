"use client"

import { useState, useEffect, useRef, useCallback } from "react"

import { useMobile } from "@/hooks/use-mobile"
import { useKeyboardControls } from "@/hooks/use-keyboard-controls"
import { useMobileJoystick } from "@/hooks/use-mobile-joystick"
import { useAbilityLogic } from "@/hooks/use-ability-logic"

import { drawArenaBoundary, drawEntities, drawFood, drawGrid, drawPlayer, drawCactus } from "@/utils/draw"
import { VIEWPORT_SIZE } from "@/utils/game-constants"
import { 
  handleCactusCollision, 
  handleFoodCollision, 
  updatePlayerPosition, 
  handlePlayerAttack, 
  applyPoisonDamageToTargets,
  applySlowToTargets
} from "@/utils/game-logic"

import { Player, GameRoom } from "@/app/interfaces"

interface GameArenaProps {
  onGameOver: (score: number, msg: string) => void;
  roomKey: string;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  gameRoom: GameRoom;
  exchangeGameRoomData: any;
  disconnectedPeers: any
  updateRoomIfHost: any | null
}

export default function GameArena({ 
  onGameOver, 
  roomKey, 
  player, 
  setPlayer,
  gameRoom,
  exchangeGameRoomData,
  disconnectedPeers,
  updateRoomIfHost
}: GameArenaProps) {
  const canvasRef = useRef(null)
  const joystickRef = useRef(null)
  const attackButtonRef = useRef<HTMLDivElement | null>(null)
  const abilityButtonRef = useRef(null);
  const attackPressedRef = useRef(false);
  const lastAttackTimeRef = useRef<number>(0);
  const activeEffectsRef = useRef<{ [key: string]: number }>({});
  const lastPoisonTickRef = useRef<{ [uid: string]: number }>({});
  
  // Ref para controlar a taxa de atualização da rede (Tick Rate)
  const lastNetworkUpdateTimeRef = useRef<number>(0);
  
  const animationId = useRef<number | null>(null);
  const isLooping = useRef<boolean>(false);
  const hasJoinedRef = useRef(false);

  const [food, setFood] = useState<any>([])
  const [cactus, setCactus] = useState<any>([])
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false })
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [joystickAngle, setJoystickAngle] = useState(0)
  const [joystickDistance, setJoystickDistance] = useState(0)
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([])

  const isMobile = useMobile();
  const { useAbility, isCooldown, cooldownTime } = useAbilityLogic(player, setPlayer, exchangeGameRoomData, activeEffectsRef);

  useKeyboardControls(player, setKeys, attackPressedRef, useAbility)
  useMobileJoystick({
    isMobile,
    joystickRef,
    attackButtonRef,
    abilityButtonRef,
    attackPressedRef,
    useAbility,
    setJoystickActive,
    setJoystickPos,
    setJoystickAngle,
    setJoystickDistance,
  });

  // Sync player join
  useEffect(() => {
    if (!player || !gameRoom || hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    updateRoomIfHost?.((room: GameRoom) => ({
      ...room,
      players: [...room.players, player],
    }));

    setCactus(gameRoom.cactus || []);
  }, [player?.uid, gameRoom?.players?.length]);

  useEffect(() => {
    if (gameRoom?.food) setFood(gameRoom.food);
  }, [gameRoom?.food]);

  // Sync players
  useEffect(() => {
    if (!player || !gameRoom?.players) return;
    const currentPlayers = gameRoom.players;
    updateSelf(currentPlayers);
    updateOtherPlayers(currentPlayers);
  }, [gameRoom?.players, player?.uid, disconnectedPeers]);
/*
  // Atualiza o próprio jogador
  const updateSelf = (players: Player[]) => {
    const updated = players.find(p => p.uid === player.uid);
    if (!updated) return;

    setPlayer(prev => {
      const outdated = (updated.lastUpdate ?? 0) <= (prev?.lastUpdate ?? 0);
      if (outdated) return prev;

      const prevPos = prev?.position ?? { x: 0, y: 0 };
      const updatedPos = updated.position ?? prevPos;
      const dist = Math.hypot(updatedPos.x - prevPos.x, updatedPos.y - prevPos.y);

      return {
        ...prev,
        ...updated,
        position: dist > 100 ? updatedPos : {
          x: (prevPos.x + updatedPos.x) / 2,
          y: (prevPos.y + updatedPos.y) / 2,
        },
      };
    });
  };
/*
  const updateOtherPlayers = (currentPlayers: Player[]) => {
    const alivePlayers = currentPlayers.filter(p => {
      if (!player) return false;

      const isDisconnected = disconnectedPeers === p.uid;
      const isDead = p.stats.health <= 0;
      const isSelf = p.uid === player.uid;

      if (isDead) {
        exchangeGameRoomData(JSON.stringify({
          type: 'player_exit',
          uid: p.uid,
          reason: 'dead',
        }));
      }

      return !isDisconnected && !isDead && !isSelf;
    });

    setOtherPlayers(prevOthers =>
      alivePlayers.map(p => {
        const existing = prevOthers.find(o => o.uid === p.uid);
        if (!existing) return p;

        const alpha = Math.min(0.5, Math.max(0.1, p.stats.speed / 15));
        return {
          ...p,
          position: {
            x: existing.position.x + alpha * (p.position.x - existing.position.x),
            y: existing.position.y + alpha * (p.position.y - existing.position.y),
          },
        };
      })
    );
  };*/

  // Atualiza o próprio jogador
  const updateSelf = (players: Player[]) => {
    const updated = players.find(p => p.uid === player.uid);
    if (!updated) return;

    setPlayer(prev => {
      if (!prev) return updated;
      
      // Checa se o pacote da rede é mais recente
      const outdated = (updated.lastUpdate ?? 0) <= (prev.lastUpdate ?? 0);
      if (outdated) return prev;

      return {
        ...prev,
        ...updated,
        // REGRA DE OURO: O movimento é 100% seu, a rede não manda nele.
        position: prev.position, 
        stats: {
          ...prev.stats,
          // ACEITA O DANO: Você precisa receber a vida calculada e enviada pelo atacante
          health: updated.stats.health 
        }
      };
    });
  };

  const updateOtherPlayers = (currentPlayers: Player[]) => {
    const alivePlayers = currentPlayers.filter(p => {
      if (!player) return false;

      const isDisconnected = disconnectedPeers === p.uid;
      const isDead = p.stats.health <= 0;
      const isSelf = p.uid === player.uid;

      if (isDead) {
        exchangeGameRoomData(JSON.stringify({
          type: 'player_exit',
          uid: p.uid,
          reason: 'dead',
        }));
      }

      return !isDisconnected && !isDead && !isSelf;
    });

    // Atualização direta sem "suavização fantasma". 
    // Garante que se a rede mandou dano, a barra de vida cai na hora no seu Canvas!
    setOtherPlayers(alivePlayers);
  };

  const renderGame = useCallback(() => {
    const canvas: HTMLCanvasElement | any = canvasRef.current
    if (!canvas || !player?.position) return;

    const ctx = canvas.getContext("2d")
    if (!ctx) return;

    const now = Date.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas, viewportOffset)
    drawArenaBoundary(ctx, viewportOffset)
    drawEntities(ctx, food, (ctx, item) => drawFood(ctx, item, viewportOffset));
    drawEntities(ctx, cactus, (ctx, item) => drawCactus(ctx, item, viewportOffset));
    otherPlayers.forEach(p => drawPlayer(ctx, p, now, viewportOffset, false))
    drawPlayer(ctx, player, now, viewportOffset, true)
  }, [food, cactus, otherPlayers, player, viewportOffset]);

  const updateGame = useCallback(() => {
    if (!canvasRef.current || !player) return;

    const updatedPlayer = { ...player };
    const now = Date.now();
    const effects = activeEffectsRef.current;

    const isInvincible = effects["Hard Shell"] > now;
    const hasSpeedBoost = effects["Speed Boost"] > now;
    const hasSlow = effects["Slow Strike"] > now;
    const hasSpecialAttack = effects["Special Attack"] > now;
    const hasPoisonCarrier = effects["Poison"] > now;

    let finalSpeed = player.stats.speed;
    if (hasSpeedBoost) finalSpeed *= player.ability.boost;

    const { newX, newY } = updatePlayerPosition(
      finalSpeed,
      isMobile,
      joystickActive,
      joystickAngle,
      joystickDistance,
      keys,
      player
    );

    setViewportOffset({ x: newX - VIEWPORT_SIZE / 2, y: newY - VIEWPORT_SIZE / 2 });
    handleFoodCollision(newX, newY, food, player, exchangeGameRoomData, setFood, updatedPlayer, updateRoomIfHost);

    const { tookDamage, newHealth } = handleCactusCollision(newX, newY, cactus, player);
    if (tookDamage && !isInvincible) {
      updatedPlayer.stats.health = newHealth;

      if (newHealth === 0) {
        handlePlayerDeath(
          player,
          "Você foi morto por cactu!",
          setOtherPlayers,
          exchangeGameRoomData,
          onGameOver,
          roomKey
        );
        return;
      }

      updateRoomIfHost?.((room: GameRoom) => ({
        ...room,
        players: room.players.map(p =>
          p.uid === player.uid ? { ...p, stats: { ...p.stats, health: newHealth } } : p
        )
      }));

      exchangeGameRoomData(JSON.stringify({
        type: 'player_health',
        uid: player.uid,
        health: newHealth,
        lastUpdate: Date.now()
      }));
    }

    if (!isInvincible) {
      if (attackPressedRef.current && now - lastAttackTimeRef.current > 500) {
        lastAttackTimeRef.current = now;
        handlePlayerAttack(
          player,
          otherPlayers,
          lastPoisonTickRef,
          exchangeGameRoomData,
          updatedPlayer,
          updateRoomIfHost,
          { hasSpecialAttack, hasPoisonCarrier }
        );
      }
  
      applyPoisonDamageToTargets(now, otherPlayers, player, lastPoisonTickRef, setOtherPlayers, exchangeGameRoomData);

      if (hasSlow) applySlowToTargets(now, otherPlayers, player, lastPoisonTickRef, setOtherPlayers, exchangeGameRoomData);
    }

    if (player.stats.health <= 0) {
      handlePlayerDeath(
        player,
        `Você foi eliminado por ${player.killer}!`,
        setOtherPlayers,
        exchangeGameRoomData,
        onGameOver,
        roomKey
      );
      return;
    }

    const newPosition = { x: newX, y: newY };
    updatedPlayer.position = newPosition
    setPlayer(updatedPlayer);

    // FIX 1: O filtro checa qualquer tipo de movimento real em vez de exigir que seja maior que 1 pixel
    const isMoving = player.position.x !== newX || player.position.y !== newY;
    
    // FIX 2: Controle de rede pelo TEMPO (Tick Rate) em vez da distância a cada frame
    // 50ms = Envia posição no máximo 20 vezes por segundo, eliminando o lag
    if (isMoving && (now - lastNetworkUpdateTimeRef.current > 30)) {
      lastNetworkUpdateTimeRef.current = now;
      
      updateRoomIfHost?.((room: GameRoom) => ({
        ...room,
        players: room.players.map(p =>
          p.uid === player.uid ? { ...p, position: newPosition } : p
        )
      }));
      
      exchangeGameRoomData(JSON.stringify({
        type: 'player_position',
        uid: updatedPlayer.uid,
        position: updatedPlayer.position,
        lastUpdate: Date.now()
      }));
    }
  }, [player, cactus, food, otherPlayers, roomKey, setPlayer, onGameOver, isMobile, joystickActive, joystickAngle, joystickDistance, keys, exchangeGameRoomData, updateRoomIfHost]);


  // FIX 3: Refs de Game Loop para blindar o Lifecycle do React contra quedas de FPS
  const updateGameRef = useRef(updateGame);
  const renderGameRef = useRef(renderGame);

  useEffect(() => {
    updateGameRef.current = updateGame;
    renderGameRef.current = renderGame;
  }, [updateGame, renderGame]);

  // Game loop otimizado
  useEffect(() => {
    // Agora só depende do uid. O React não vai mais destruir e recriar esse loop inteiro a 60 frames por segundo
    if (!player?.uid || isLooping.current) return;
    isLooping.current = true;

    const loop = () => {
      if (!isLooping.current) return;
      
      updateGameRef.current();
      renderGameRef.current();
      
      animationId.current = requestAnimationFrame(loop);
    };

    animationId.current = requestAnimationFrame(loop);
    
    return () => {
      if (animationId.current) cancelAnimationFrame(animationId.current);
      isLooping.current = false;
    };
  }, [player?.uid]);

  const handlePlayerDeath = (
    player: Player,
    reason: string,
    setOtherPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
    exchangeGameRoomData: (data: string) => void,
    onGameOver: (score: number, message: string) => void,
    roomKey: string
  ) => {
    onGameOver(player.score, reason);

    setOtherPlayers(prev => prev.filter(p => p.uid !== player.uid));

    exchangeGameRoomData(JSON.stringify({
      type: 'player_exit',
      uid: player.uid,
      room: roomKey,
    }));
  };

  const exitGame = () => {
    const confirmExit = window.confirm("Tem certeza que deseja sair da partida? Você irá perder sua pontuação atual.");
    if (confirmExit) onGameOver(0, 'Você saiu!');
  };

  const handleCopy = () => navigator.clipboard.writeText(roomKey).then(() => alert('Copied!'))

  const healthPercentage = (player.stats.health / player.stats.maxHealth) * 100;
  const cooldownPercentage = isCooldown ? (cooldownTime / (player.ability.cooldown * 1000)) * 100 : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-green-950">
      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        width={VIEWPORT_SIZE}
        height={VIEWPORT_SIZE}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-green-900/70 p-2 rounded-lg">
          <div className="text-sm text-green-300">Pontuação: {player.score}</div>
          <div className="text-sm text-green-300">Seu nome: {player.name}</div>
          <div className="text-sm text-green-300">Players On: {otherPlayers.length}</div>
          <div title="Copy" style={{ cursor: 'pointer' }} onClick={handleCopy} className="text-sm px-2 py-2 rounded-md text-green-300 bg-[#111]">ROOM ID: {roomKey}</div>
        </div>

        <div className="w-1/3 space-y-3">
          {/* Vida */}
          <div>
            <div className="text-xs text-green-300 mb-1 font-semibold tracking-wide">
              ❤️ Vida: {Math.floor(player.stats.health)}/{player.stats.maxHealth}
            </div>
            <div className="w-full h-3 rounded-md bg-green-900/30 overflow-hidden">
              <div
                className={`
                  h-full transition-all duration-300
                  ${healthPercentage > 50
                    ? "bg-green-300"
                    : healthPercentage > 25
                    ? "bg-orange-400"
                    : "bg-red-500"}
                `}
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
          </div>

          {/* Cooldown */}
          {isCooldown && (
            <div>
              <div className="text-xs text-green-300 mb-1 font-semibold tracking-wide">
                ⏳ Cooldown: {Math.floor(cooldownTime / 1000)}s
              </div>
              <div className="w-full h-3 rounded-md bg-red-900/30 overflow-hidden">
                <div
                  className="h-full bg-lime-500 transition-all duration-300"
                  style={{ width: `${cooldownPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button className="flex items-center text-green-300 hover:text-white hover:bg-green-800 rounded-md px-4 py-2"
            onClick={() => exitGame()}
          >
            Sair
          </button>
        </div>
      </div>

      {player.ability && (
        <div className="absolute top-36 left-4 right-4 flex justify-between items-center">
          <div className="bg-green-900/70 p-2 rounded-lg">
            <p className="text-sm text-green-300 font-semibold">Pressione <span className="text-white">E</span> para ativar sua habilidade</p>
            <p className="text-sm text-green-300"><span className="font-medium">Habilidade:</span> {player.ability.name}</p>
            <p className="text-sm text-green-300"><span className="font-medium">Descrição:</span> {/*JSON.stringify(gameRoom.players)*/player.ability.description}</p>
          </div>
        </div>
      )}

      {/* Mobile controls */}
      {isMobile && (
        <div
          ref={joystickRef}
          className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-green-900/50 border-2 border-green-500"
        >
          <div
            className="absolute w-16 h-16 rounded-full bg-green-700 border-2 border-green-400"
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
              left: "calc(50% - 32px)",
              top: "calc(50% - 32px)",
            }}
          />
        </div>
      )}

      {isMobile && (
        <>
          <div ref={attackButtonRef} className="floating-button attack">⚔️</div>
          <button ref={abilityButtonRef} className="floating-button special">🌀</button> 
        </>
      )}
    </div>
  )
}