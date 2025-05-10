"use client"

import { useState, useEffect, useRef, useCallback } from "react"

import { useMobile } from "@/hooks/use-mobile"
import { useKeyboardControls } from "@/hooks/use-keyboard-controls"
import { useMobileAttackButton } from "@/hooks/use-mobile-attack-button"
import { useMobileJoystick } from "@/hooks/use-mobile-joystick"
import { useAbilityControl } from "@/hooks/use-ability-control"
import { useMobileAbilityButton } from "@/hooks/use-mobile-ability-button"
import { useAbilityLogic } from "@/hooks/use-ability-logic"

import { drawArenaBoundary, drawEntities, drawFood, drawGrid, drawPlayer, drawCactus } from "@/utils/draw"
import { VIEWPORT_SIZE } from "@/utils/game-constants"
import { 
  handleCactusCollision, 
  handleFoodCollision, 
  updatePlayerPosition, 
  handlePlayerAttack, 
  applyPoisonDamageToTargets 
} from "@/utils/game-logic"

import { Player, GameRoom } from "@/app/interfaces"

interface GameArenaProps {
  setAssassin: React.Dispatch<React.SetStateAction<string>>;
  onGameOver: (score: number) => void;
  roomKey: string;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  gameRoom: GameRoom;
  sendToRoom: any;
  disconnectedPeers: any
}

export default function GameArena({ 
  setAssassin, 
  onGameOver, 
  roomKey, 
  player, 
  setPlayer, 
  gameRoom,
  sendToRoom,
  disconnectedPeers
}: GameArenaProps) {
  const canvasRef = useRef(null)
  const joystickRef = useRef(null)
  const attackButtonRef = useRef<HTMLDivElement | null>(null)
  const abilityButtonRef = useRef(null);
  const attackPressedRef = useRef(false);
  const lastAttackTimeRef = useRef<number>(0);
  const activeEffectsRef = useRef<{ [key: string]: number }>({});
  const lastPoisonTickRef = useRef<{ [uid: string]: number }>({});
  const animationId = useRef<number | null>(null);
  const isLooping = useRef<boolean>(false);

  const [food, setFood] = useState<any>([])
  const [cactus, setCactus] = useState<any>([])
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false })
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [joystickAngle, setJoystickAngle] = useState(0)
  const [joystickDistance, setJoystickDistance] = useState(0)
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([])

  const isMobile = useMobile()
  useKeyboardControls(setKeys, attackPressedRef)
  useMobileAttackButton(isMobile, attackButtonRef, attackPressedRef)
  useMobileJoystick(isMobile,
    joystickRef,
    joystickActive,
    setJoystickActive,
    setJoystickPos,
    setJoystickAngle,
    setJoystickDistance
  );

  const { useAbility, isCooldown, cooldownTime } = useAbilityLogic(player, roomKey, setPlayer, sendToRoom);

  useAbilityControl(player, useAbility);
  useMobileAbilityButton(isMobile, abilityButtonRef, useAbility);

  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!player || !gameRoom || hasJoinedRef.current) return;

    hasJoinedRef.current = true;

    setCactus(gameRoom.cactus || []);
  }, [player?.uid, gameRoom?.players?.length]);

  useEffect(() => {
    if (gameRoom?.food) setFood(gameRoom.food);
  }, [gameRoom?.food]);

  useEffect(() => {
    if (!player || !gameRoom?.players) return;

    const currentPlayers = gameRoom.players;

    // Atualiza o próprio player
    const updatedSelf = currentPlayers.find(p => p.uid === player.uid);
    if (updatedSelf) {
      setPlayer((prev: any) => {
        const prevUpdate = prev?.lastUpdate ?? 0;
        const nextUpdate = updatedSelf.lastUpdate ?? 0;

        if (nextUpdate > prevUpdate) {
          return {
            ...prev,
            stats: {
              ...prev.stats,
              ...(updatedSelf.stats || {}),
            },
            effects: {
              ...prev.effects,
              ...(updatedSelf.effects || {}),
            },
            ability: updatedSelf.ability ?? prev.ability,
            lastUpdate: nextUpdate,
            position: prev.position, // mantém posição local
          };
        }

        return prev;
      });
    }

    // Atualiza os outros jogadores - garantir que mortos sejam removidos
    const updatedOthers = currentPlayers.filter(p => {
      const isDisconnected = disconnectedPeers && p.uid === disconnectedPeers;
      const isDead = p.stats.health <= 0;

      if (isDead) {
        // Envia mensagem de que o jogador morreu
        sendToRoom(JSON.stringify({
          type: 'player_exit',
          uid: p.uid,
          reason: 'dead'
        }));
      }

      return !isDisconnected && !isDead && p.uid !== player.uid;
    });

    setOtherPlayers(updatedOthers);
  }, [gameRoom?.players, player?.uid, disconnectedPeers]);

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

    const now = Date.now();
    const nowEffect = now;
    const isInvincible = activeEffectsRef.current["invincible"] > nowEffect;
    const hasSpeedBoost = activeEffectsRef.current["speedBoost"] > nowEffect;
    const hasSlow = activeEffectsRef.current["slow"] > nowEffect;

    let finalSpeed = player.stats.speed;
    if (hasSpeedBoost) finalSpeed *= player.ability.boost;
    if (hasSlow) finalSpeed *= player.ability.slowAmount;

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
    handleFoodCollision(newX, newY, food, player, sendToRoom, setFood);

    const { tookDamage, newHealth } = handleCactusCollision(newX, newY, cactus, player);
    if (tookDamage && !isInvincible) {
      if (newHealth === 0) {
        setAssassin("Você foi morto por cactu!");
        onGameOver(player.score);
      }
  
        sendToRoom(JSON.stringify({
          type: 'player_update',
          uid: player.uid,
          updates: { stats: { health: newHealth } },
          lastUpdate: Date.now()
        }));
      
    }

    if (attackPressedRef.current && now - lastAttackTimeRef.current > 500) {
      lastAttackTimeRef.current = now;
      handlePlayerAttack(player, otherPlayers, roomKey, setOtherPlayers, lastPoisonTickRef, sendToRoom);
    }

    applyPoisonDamageToTargets(nowEffect, now, otherPlayers, roomKey, player, lastPoisonTickRef, setOtherPlayers, sendToRoom);

    if (player.stats.health <= 0) {
      setAssassin(`Você foi eliminado por ${player.killer || 'desconhecido'}!`);
      onGameOver(player.score);
      setOtherPlayers(prev => prev.filter(p => p.uid !== player.uid));

      sendToRoom(JSON.stringify({
        type: 'player_exit',
        uid: player.uid,
        room: roomKey
      }));
      return;
    }

    const newPosition = { x: newX, y: newY };
    const updatedPlayer = { 
      ...player, 
      stats: { ...player.stats, health: newHealth }, // Atualiza a saúde
      position: newPosition // Atualiza a posição
    };
    setPlayer(updatedPlayer);

    if (
      Math.abs(player.position.x - newPosition.x) > 1 ||
      Math.abs(player.position.y - newPosition.y) > 1
    ) {
      sendToRoom(JSON.stringify({
        type: 'player_update',
        uid: updatedPlayer.uid,
        updates: { position: updatedPlayer.position },
        lastUpdate: Date.now()
      }));
    }
  }, [player, cactus, food, otherPlayers, roomKey, setPlayer, onGameOver]);

  // Game loop
  useEffect(() => {
    if (!player || isLooping.current) return;

    const loop = () => {
      if (!player) {
        cancelAnimationFrame(animationId.current!);
        return;
      }
      updateGame();
      renderGame();
      animationId.current = requestAnimationFrame(loop);
    };

    isLooping.current = true;
    animationId.current = requestAnimationFrame(loop);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
        isLooping.current = false;
      }
    };
  }, [player, updateGame, renderGame]);

  const exitGame = () => {
    const confirmExit = window.confirm("Tem certeza que deseja sair da partida? Você irá perder sua pontuação atual.");
    if (confirmExit) {
      setAssassin('');
      onGameOver(0);
    }
  };

  const healthPercentage = (player.stats.health / player.stats.maxHealth) * 100;
  const cooldownPercentage = (cooldownTime / (player.ability.cooldown * 1000)) * 100;

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
          <div className="text-sm text-green-300">ROOM ID: {roomKey}</div>
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
        <div className="absolute top-28 left-4 right-4 flex justify-between items-center">
          <div className="bg-green-900/70 p-2 rounded-lg">
            <p className="text-sm text-green-300 font-semibold">Pressione <span className="text-white">E</span> para ativar sua habilidade</p>
            <p className="text-sm text-green-300"><span className="font-medium">Habilidade:</span> {player.ability.name}</p>
            <p className="text-sm text-green-300"><span className="font-medium">Descrição:</span> {player.ability.description}</p>
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
