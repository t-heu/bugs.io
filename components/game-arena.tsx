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

import { database, ref, update, off, onValue, onChildChanged, get } from "@/api/firebase"
import { drawArenaBoundary, drawEntities, drawFood, drawGrid, drawPlayer, drawCactus } from "@/utils/draw"
import { generateFood } from "@/utils/food"
import { monitorConnectionStatus } from "@/utils/monitor-connection"
import { ARENA_SIZE, VIEWPORT_SIZE, FOOD_VALUE_HEATH, FOOD_VALUE_SCORE } from "@/utils/game-constants"

export default function GameArena({ setAssassin, onGameOver, roomKey, player, setPlayer }: any) {
  const canvasRef = useRef(null)
  const joystickRef = useRef(null)
  const attackButtonRef = useRef<HTMLDivElement | null>(null)
  const abilityButtonRef = useRef(null);
  const attackPressedRef = useRef(false);
  const lastAttackTimeRef = useRef<number>(0);
  const activeEffectsRef = useRef<{ [key: string]: number }>({});
  const lastPoisonTickRef = useRef<{ [uid: string]: number }>({});

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

  const { sendPosition } = usePlayerPositionSocket(player, roomKey, (update) => {
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
        setAssassin(value.killer || '')
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
          if (JSON.stringify(prevState) !== JSON.stringify(otherPlayers)) {
            return otherPlayers;
          }
          return prevState;
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

  const renderGame = useCallback(() => {
    const canvas: HTMLCanvasElement | any = canvasRef.current
    if (!canvas) return
  
    const ctx = canvas.getContext("2d")
    if (!ctx) return
  
    const now = Date.now()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  
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
    if (!canvasRef.current) return;
    if (!player) return;

    const now = Date.now()
    const nowEffect = now
    const isInvincible = activeEffectsRef.current["invincible"] && activeEffectsRef.current["invincible"] > nowEffect;
    const hasSpeedBoost = activeEffectsRef.current["speedBoost"] && activeEffectsRef.current["speedBoost"] > nowEffect;
  
    let speed = hasSpeedBoost ? player.stats.speed *= player.ability.boost : player.stats.speed;

    const { newX, newY } = updatePlayerPosition(speed);
  
    setViewportOffset({
      x: newX - VIEWPORT_SIZE / 2,
      y: newY - VIEWPORT_SIZE / 2,
    });

    handleFoodCollision(newX, newY, food, player);

    const {tookDamage, newHealth} = handleCactusCollision(newX, newY, cactus, player)
    if (tookDamage && !isInvincible) {
      if (newHealth === 0) {
        setAssassin("cactu");
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
      handlePlayerAttack(player, otherPlayers);
    }    

    // dar dano de veneno a cada segundo
    applyPoisonDamageToTargets(nowEffect, now)

    // ☠️ Verifica morte
    if (player.stats.health <= 0) {
      get(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`)).then(snapshot => {
        const data = snapshot.val()
        setPlayer(data)
        setAssassin(data.killer || '')
      });

      onGameOver(player.score);
      return;
    }

    /*const newPosition = { x: newX, y: newY }
    setPlayer((prev: any) => ({
      ...prev,
      position: newPosition,
    }))
    update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}/position`), newPosition)*/
    const newPosition = { x: newX, y: newY };
    setPlayer((prev: any) => ({
      ...prev,
      position: newPosition,
    }));
    sendPosition(newPosition); // WebSocket
  }, [player, cactus, food, otherPlayers, roomKey, setPlayer, onGameOver])

  // Game loop
  useEffect(() => {
    if (!player || gameOver) return
    let animationId: number

    const loop = () => {
      updateGame()
      renderGame()
      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animationId)
  }, [player, gameOver, updateGame, renderGame]);

  const applyPoisonDamageToTargets = (nowEffect: any, now: any) => {
    otherPlayers.forEach((target) => {
      const isPoisoned = target.effects.poisonedUntil && target.effects.poisonedUntil > now;
      const lastTick = lastPoisonTickRef.current[target.uid] || 0;
      const tickElapsed = now - lastTick > 1000;

      if (!isPoisoned || !tickElapsed) return;

      let poisonDamage = player.ability.poisonDamage || 0;

      const bonus = player.ability?.specialBonusDamage;
      if (bonus && bonus.target === target.id && bonus.bonusDamage !== undefined) {
        poisonDamage += bonus.bonusDamage || 0;
      }

      const newHealth = Math.max(0, target.stats.health - poisonDamage);

      update(ref(database, `bugsio/rooms/${roomKey}/players/p${target.uid}/stats`), {
        health: newHealth,
      });

      setOtherPlayers((prev) =>
        prev.map((p) =>
          p.uid === target.uid
            ? { ...p, stats: { ...p.stats, health: newHealth } }
            : p
        )
      );

      lastPoisonTickRef.current[target.uid] = nowEffect;
    });
  }
  
  function handlePlayerAttack(
    player: any,
    otherPlayers: any[]
  ) {
    const attackRange = 50;
    const damagedUIDs = new Set();
  
    otherPlayers.forEach((targetPlayer) => {
      console.log(targetPlayer.position.x, player.position.x)
      const dist = Math.hypot(
        targetPlayer.position.x - player.position.x,
        targetPlayer.position.y - player.position.y
      );
      if (dist > attackRange) return;
      if (damagedUIDs.has(targetPlayer.uid)) return;
      if (targetPlayer.effects?.invincible && targetPlayer.effects.invincible > Date.now()) return;
  
      damagedUIDs.add(targetPlayer.uid);
  
      const playerAttack = player.stats.attack * (player.size / 30);
      const isSpecialAttackActive = player.effects.specialAttack > Date.now();
      const multiplier = isSpecialAttackActive ? player.ability.damageMultiplier : 1.5;
      const damageToTarget = playerAttack * multiplier;
  
      const newHealthTarget = Math.max(0, targetPlayer.stats.health - damageToTarget);
  
      // Atualiza Firebase
      update(ref(database, `bugsio/rooms/${roomKey}/players/p${targetPlayer.uid}/stats`), {
        health: newHealthTarget,
      });
  
      // Atualiza local
      setOtherPlayers((prev) =>
        prev.map((p) =>
          p.uid === targetPlayer.uid
            ? { ...p, stats: { ...p.stats, health: newHealthTarget } }
            : p
        )
      );
  
      if (player.poisonNextAttack) {
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${targetPlayer.uid}/effects`), {
          poisonedUntil: Date.now() + player.ability.duration,
        });
  
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`), {
          poisonNextAttack: false,
        });
  
        lastPoisonTickRef.current[targetPlayer.uid] = Date.now();
      }
  
      if (targetPlayer.name && newHealthTarget === 0) {
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${targetPlayer.uid}`), {
          killer: `${player.name} - (${player.type})`,
        });
  
        const newScore = player.score + 15;
  
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`), {
          score: newScore,
        });
      }
    });
  }

  function updatePlayerPosition(speed: any) {
    let dx = 0, dy = 0
  
    if (isMobile && joystickActive) {
      dx = Math.cos(joystickAngle) * joystickDistance * speed
      dy = Math.sin(joystickAngle) * joystickDistance * speed
    } else {
      if (keys.up) dy -= speed
      if (keys.down) dy += speed
      if (keys.left) dx -= speed
      if (keys.right) dx += speed
  
      if (dx !== 0 && dy !== 0) {
        const normalizationFactor = 1 / Math.sqrt(2);
        dx *= normalizationFactor;
        dy *= normalizationFactor;
      }
    }
  
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const newX = Math.round(clamp(player.position.x + dx, 0, ARENA_SIZE));
    const newY = Math.round(clamp(player.position.y + dy, 0, ARENA_SIZE));
    return { newX, newY, dx, dy }
  }

  function handleCactusCollision(x: number, y: number, cactusList: any[], player: any) {
    let tookDamage = false;
    let newHealth = player.stats.health;
    const now = Date.now();
  
    cactusList.forEach((cactus) => {
      const distance = Math.hypot(x - cactus.x, y - cactus.y);
      const collisionThreshold = (player.size + cactus.size) / 2;
  
      if (distance < collisionThreshold) {
        const timeSinceLastHit = now - (cactus.lastHit ?? 0);
  
        if (timeSinceLastHit > 500) {
          cactus.lastHit = now;
          newHealth = Math.max(0, player.stats.health - 5);
          tookDamage = true;
        }
      }
    });
  
    return { tookDamage, newHealth };
  }    

  function handleFoodCollision(x: number, y: number, foodList: any[], player: any) {
    const updatedFood = [...foodList];
  
    updatedFood.forEach((food, index) => {
      const distance = Math.hypot(x - food.x, y - food.y);
  
      const collisionThreshold = (player.size + food.size) / 2;
      if (distance < collisionThreshold) {
        const newFood = generateFood(ARENA_SIZE);
        updatedFood[index] = newFood;
  
        update(ref(database, `bugsio/rooms/${roomKey}/food/${index}`), newFood);
  
        const newHealth = Math.min(player.stats.health + FOOD_VALUE_HEATH, player.stats.maxHealth);
        const newScore = player.score + FOOD_VALUE_SCORE;
  
        // Atualiza o estado local do player
        setPlayer((prev: any) => ({
          ...prev,
          stats: {
            ...prev.stats,
            health: newHealth,
          },
          score: newScore,
        }));
  
        // Atualiza o player no Firebase
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`), {
          'stats/health': newHealth,
          score: newScore,
        })
      }
    });
  
    return { updatedFood };
  }

  const exitGame = () => {
    const confirmExit = window.confirm("Tem certeza que deseja sair da partida? Você ira perder sua pontuação atual.")
    if (confirmExit) {
      onGameOver(0);
      setAssassin('')
    }
  }

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
          <div ref={attackButtonRef} className="floating-button attack">
            ⚔️
          </div>
          <button ref={abilityButtonRef} className="floating-button special">⚡</button> 
        </>
      )}
    </div>
  )
}
