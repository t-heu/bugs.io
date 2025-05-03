"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import { useMobile } from "@/hooks/use-mobile"
import { useKeyboardControls } from "@/hooks/use-keyboard-controls"
import { useMobileAttackButton } from "@/hooks/use-mobile-attack-button"
import { useMobileJoystick } from "@/hooks/use-mobile-joystick"
import { useAbilityControl } from "@/hooks/use-ability-control"
import { useMobileAbilityButton } from "@/hooks/use-mobile-ability-button"
import { useAbilityLogic } from "@/hooks/use-ability-logic"
import { usePlayerPositionSocket } from "@/hooks/use-player-position-socket"

import { database, ref, update, off, onValue, onChildChanged, get, remove } from "@/api/firebase"
import { drawArenaBoundary, drawEntities, drawFood, drawGrid, drawPlayer, drawCactus } from "@/utils/draw"
import { monitorConnectionStatus } from "@/utils/monitor-connection"
import { VIEWPORT_SIZE } from "@/utils/game-constants"
import { handleCactusCollision, handleFoodCollision, updatePlayerPosition, handlePlayerAttack, applyPoisonDamageToTargets } from "@/utils/game-logic"

export default function GameArena({ setAssassin, onGameOver, roomKey, player, setPlayer }: any) {
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
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [gameOver, setGameOver] = useState(false)

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

  const { useAbility, isCooldown, cooldownTime } = useAbilityLogic(player, roomKey, setPlayer);

  useAbilityControl(player, useAbility);
  useMobileAbilityButton(isMobile, abilityButtonRef, useAbility);

  const { sendPosition, isDisconnected } = usePlayerPositionSocket(player, roomKey, (update) => {
    setOtherPlayers((prev) =>
      prev.map((p) => (p.uid === update.uid ? { ...p, position: { x: update.x, y: update.y } } : p))
    );
  });  

  useEffect(() => monitorConnectionStatus(roomKey, player.uid), [roomKey, player.uid]);
  
  // Inicializa o jogo uma única vez
  useEffect(() => {
    const data = ref(database, `bugsio/rooms/${roomKey}`)
    get(data).then(snapshot => {
      const snapData = snapshot.val() || {}
      setCactus(snapData.cactus || [])
      setFood(snapData.food || [])
    })
  }, [roomKey])  

  // Escuta mudanças no jogador
  useEffect(() => {
    if (!roomKey || !player?.uid) return
    const playerRef = ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`)

    const unsubscribe = onChildChanged(playerRef, snapshot => {
      const key = snapshot.key
      const value = snapshot.val()
      if (!key) return

      if (value?.stats?.health === 0) {
        setAssassin(`Você foi eliminado por ${value.killer}!` || '')
        setGameOver(true)
        onGameOver(player.score)
        return
      }

      setPlayer((prev: any) => ({ ...prev, [key]: value }))
    })

    return () => off(playerRef, 'child_changed', unsubscribe)
  }, [roomKey, player?.uid, setPlayer])

  // Escuta outros jogadores
  useEffect(() => {
    if (!roomKey) return;
  
    const playersRef = ref(database, `bugsio/rooms/${roomKey}/players`);
  
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const playersData = snapshot.val() || {};
      let otherPlayers = Object.values(playersData).filter(
        (p: any) => p.uid !== player.uid
      );
  
      // Remove jogadores com saúde 0
      otherPlayers = otherPlayers.filter((p: any) => p.stats.health > 0);
  
      // Adia o setState para o final do ciclo de render
      setTimeout(() => {
        setOtherPlayers((prevState) => {
          const updated = Object.values(playersData)
            .filter((p: any) => p.uid !== player.uid && p.stats.health > 0)
            .map((p: any) => {
              const existing = prevState.find((op) => op.uid === p.uid);
              return {
                ...p,
                // Se o dado do Firebase não tiver posição, mantém a anterior
                position: p.position ?? existing?.position ?? { x: 0, y: 0 },
              };
            });
      
          return updated;
        });
      }, 0);
    });
  
    return () => {
      off(playersRef, "value", unsubscribe);
    };
  }, [roomKey, player.uid]);  

  // update food
  useEffect(() => {
    if (!roomKey) return;
  
    const foodRef = ref(database, `bugsio/rooms/${roomKey}/food`);
    const unsubscribeChanged = onChildChanged(foodRef, (snapshot) => {
      const index = snapshot.key;
      const data = snapshot.val();
  
      setFood((prev: any) => {
        const updated = [...prev];
        updated[Number(index)] = data;
        return updated;
      });
    });
  
    return () => {
      off(foodRef, 'child_changed', unsubscribeChanged);
    };
  }, [roomKey]);

  useEffect(() => {
    if (isDisconnected.current) {
      removePlayer('Sua conexão foi perdida ou você ficou inativo por um tempo.');
    }
  }, [isDisconnected.current]);

  const renderGame = useCallback(() => {
    const canvas: HTMLCanvasElement | any = canvasRef.current
    if (!canvas) return
  
    const ctx = canvas.getContext("2d")
    if (!ctx) return
  
    const now = Date.now()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!player?.position) return;

    drawGrid(ctx, canvas, viewportOffset)
    drawArenaBoundary(ctx, viewportOffset)
    drawEntities(ctx, food, (ctx, item) => drawFood(ctx, item, viewportOffset));
    drawEntities(ctx, cactus, (ctx, item) => drawCactus(ctx, item, viewportOffset));
    otherPlayers.forEach(p => {
      drawPlayer(ctx, p, now, viewportOffset, false)
    })
    drawPlayer(ctx, player, now, viewportOffset, true)
  }, [food, cactus, otherPlayers, player, viewportOffset])

  const updateGame = useCallback(() => {
    if (!canvasRef.current || !player) return;
    
    const now = Date.now()
    const nowEffect = now
    const isInvincible = activeEffectsRef.current["invincible"] && activeEffectsRef.current["invincible"] > nowEffect;
    const hasSpeedBoost = activeEffectsRef.current["speedBoost"] && activeEffectsRef.current["speedBoost"] > nowEffect;
    const hasSlow = activeEffectsRef.current["slow"] && activeEffectsRef.current["slow"] > nowEffect;

    let finalSpeed = player.stats.speed;

    if (hasSpeedBoost) {
      finalSpeed *= player.ability.boost;
    }

    if (hasSlow) {
      finalSpeed *= player.ability.slowAmount;
    }

    let speed = finalSpeed;

    const { newX, newY } = updatePlayerPosition(
      speed, 
      isMobile, 
      joystickActive, 
      joystickAngle,
      joystickDistance,
      keys,
      player
    );
  
    setViewportOffset({
      x: newX - VIEWPORT_SIZE / 2,
      y: newY - VIEWPORT_SIZE / 2,
    });

    const {newHealth_food, newScore_food} = handleFoodCollision(newX, newY, food, player, roomKey);
    if (newHealth_food || newScore_food) {
      // Atualiza o estado local do player
      setPlayer((prev: any) => ({
        ...prev,
        stats: {
          ...prev.stats,
          health: newHealth_food,
        },
        score: newScore_food,
      }));
  
      // Atualiza o player no Firebase
      update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`), {
        'stats/health': newHealth_food,
        score: newScore_food,
      })
    }

    const {tookDamage, newHealth} = handleCactusCollision(newX, newY, cactus, player)
    if (tookDamage && !isInvincible) {
      if (newHealth === 0) {
        setAssassin("Você foi eliminado por cactu!");
        onGameOver(player.score);
      }
  
      setPlayer((prev: any) => ({
        ...prev,
        stats: {
          ...prev.stats,
          health: newHealth,
        },
      }))
      update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}/stats`), {
        health: newHealth,
      })      
    }   

    if (attackPressedRef.current && now - lastAttackTimeRef.current > 500) {
      lastAttackTimeRef.current = now;
      handlePlayerAttack(
        player, 
        otherPlayers,
        roomKey,
        setOtherPlayers,
        lastPoisonTickRef
      );
    }    

    // dar dano de veneno a cada segundo
    applyPoisonDamageToTargets(
      nowEffect, now, otherPlayers, roomKey, player, lastPoisonTickRef, setOtherPlayers
    )

    // ☠️ Verifica morte
    if (player.stats.health <= 0) {
      get(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`)).then(snapshot => {
        const data = snapshot.val()
        setPlayer(data)
        setAssassin(`Você foi eliminado por ${data.killer}!` || '')
      });

      onGameOver(player.score);
      return;
    }

    const newPosition = { x: newX, y: newY };
    setPlayer((prev: any) => ({
      ...prev,
      position: newPosition,
    }));
    sendPosition(newPosition);
  }, [player, cactus, food, otherPlayers, roomKey, setPlayer, onGameOver])

  // Game loop
  useEffect(() => {
    if (!player || gameOver || isLooping.current) return;

    const loop = () => {
      if (!player || gameOver) {
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
  }, [player, gameOver, updateGame, renderGame]);

  const removePlayer = (msg: string = '') => {
    const playerRef = ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`);
    remove(playerRef)
      .then(() => {
        setAssassin(msg);
        onGameOver(0);
      })
      .catch((error) => {
        console.error("Erro ao remover jogador:", error);
      });
  };  

  const exitGame = () => {
    const confirmExit = window.confirm("Tem certeza que deseja sair da partida? Você irá perder sua pontuação atual.");
    if (confirmExit) {
      removePlayer();
    }
  };
  
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
        </div>

        <div className="w-1/3 space-y-3">
          {/* Vida */}
          <div>
            <div className="text-xs text-green-300 mb-1 font-semibold tracking-wide">
              ❤️ Vida: {Math.floor(player.stats.health)}/{player.stats.maxHealth}
            </div>
            <Progress
              value={(player.stats.health / player.stats.maxHealth) * 100}
              className={`
                h-3 rounded-md overflow-hidden transition-all duration-300
                bg-green-900/30
                ${
                  (player.stats.health / player.stats.maxHealth) > 0.5
                    ? "[&>div]:bg-green-300"
                    : (player.stats.health / player.stats.maxHealth) > 0.25
                    ? "[&>div]:bg-orange-400"
                    : "[&>div]:bg-red-500"
                }
              `}
            />
          </div>

          {/* Cooldown */}
          {isCooldown && (
            <div>
              <div className="text-xs text-green-300 mb-1 font-semibold tracking-wide">
                ⏳ Cooldown: {Math.floor(cooldownTime / 1000)}s
              </div>
              <Progress
                value={(cooldownTime / (player.ability.cooldown * 1000)) * 100}
                className="h-3 rounded-md bg-red-900/30 overflow-hidden transition-all duration-300 [&>div]:bg-lime-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="text-green-300 hover:text-white hover:bg-green-800"
            onClick={() => exitGame()}            
          >
            Sair
          </Button>
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
