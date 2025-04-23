"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import { useMobile } from "@/hooks/use-mobile"
import { useKeyboardControls } from "@/hooks/useKeyboardControls"
import { useMobileAttackButton } from "@/hooks/useMobileAttackButton"
import { useMobileJoystick } from "@/hooks/useMobileJoystick"

import { database, set, ref, update, off, onValue, onChildChanged } from "@/api/firebase"
import { drawArenaBoundary, drawEntities, drawFood, drawGrid, drawPlayer, drawCactus } from "@/utils/draw"
import { generateFood } from "@/utils/food"
import { monitorConnectionStatus, exitPlayer } from "@/utils/monitorConnection"
import { ARENA_SIZE, VIEWPORT_SIZE, FOOD_VALUE_HEATH, FOOD_VALUE_SCORE } from "@/utils/gameConstants"

type HandleDeathOptions = {
  playerUid?: string;
  score?: number;
};

export default function GameArena({ setAssassin, onGameOver, roomKey, player, setPlayer }: any) {
  const canvasRef = useRef(null)
  const gameInitializedRef = useRef(false)
  const frameCountRef = useRef(0)
  const joystickRef = useRef(null)
  const attackButtonRef = useRef<HTMLDivElement | null>(null)
  const attackPressedRef = useRef(false);
  const lastAttackTimeRef = useRef<number>(0);

  const [food, setFood] = useState<any>([])
  const [cactus, setCactus] = useState<any>([])
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false })
  const [gameRunning, setGameRunning] = useState(true)
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })

  const isMobile = useMobile()
  
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [joystickAngle, setJoystickAngle] = useState(0)
  const [joystickDistance, setJoystickDistance] = useState(0)
  const [debugInfo, setDebugInfo] = useState({ frameCount: 0, playersCount: 0, name: '' })
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])

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
  
  // 🔁 Inicializa o jogo uma única vez
  useEffect(() => {
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true
  
    const cactusRef = ref(database, `bugsio/rooms/${roomKey}/cactus`)
    const unsubscribe = onValue(cactusRef, (snapshot) => {
      const cactusData = snapshot.val() || []
      setCactus(cactusData)
    })
  
    return () => off(cactusRef, 'value', unsubscribe)
  }, [])  

  // 🔁 Escuta tudo do jogador (atualiza todo objeto sempre que algo muda)
  useEffect(() => {
    if (!roomKey || !player?.uid) return;

    const playerRef = ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`);

    // 🔁 Escuta mudanças individuais nos campos
    const unsubscribe = onChildChanged(playerRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();

      if (!key) return;

      // Atualiza só o campo alterado
      setPlayer((prevPlayer: any) => ({
        ...prevPlayer,
        [key]: value,
      }));
    });

    return () => {
      off(playerRef, "child_changed", unsubscribe);
    };
  }, [roomKey, player?.uid]); 
  
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
      otherPlayers = otherPlayers.filter((p: any) => p.health > 0);
  
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
    if (!roomKey) return
  
    const foodRef = ref(database, `bugsio/rooms/${roomKey}/food`)
    const unsubscribe = onValue(foodRef, (snapshot) => {
      const foodData = snapshot.val() || []
      setFood(foodData)
    })
  
    return () => off(foodRef, 'value', unsubscribe)
  }, [roomKey]) 

  // Game loop
  useEffect(() => {
    if (!gameRunning) return

    let animationFrameId: any
    let lastTime = 0

    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp
      //const deltaTime = (timestamp - lastTime) / 1000
      lastTime = timestamp

      frameCountRef.current += 1
      if (frameCountRef.current % 30 === 0) {
        // Atualizar a cada 30 frames
        setDebugInfo((prev) => ({
          ...prev,
          frameCount: frameCountRef.current,
          playersCount: otherPlayers.length,
          name: player.name
        }))
      }

      updateGame()
      renderGame()

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameRunning, player, food, keys, joystickActive, joystickAngle, joystickDistance])
  
  const handlePlayerDeath = ({
    playerUid,
    score = 0
  }: HandleDeathOptions) => {
    if (!playerUid) return;

    sessionStorage.setItem("score", String(score));
    setPlayer(null);
    setGameRunning(false);
    onGameOver?.(score);
    exitPlayer(roomKey, playerUid);
  };    

  const renderGame = () => {
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
  }

  const updateGame = () => {
    if (!canvasRef.current) return;
    if (!player) return; // Proteção básica
  
    const { newX, newY } = updatePlayerPosition();
  
    setViewportOffset({
      x: newX - VIEWPORT_SIZE / 2,
      y: newY - VIEWPORT_SIZE / 2,
    });
  
    // Colisão com comida
    const { updatedFood, foodEaten } = handleFoodCollision(newX, newY, food, player);
  
    if (foodEaten) {
      setFood(updatedFood);
    }

    // ⚔️ Dano de cactu
    const {tookDamage, newHealth} = handleCactusCollision(newX, newY, cactus, player)
    if (tookDamage) {
      if (newHealth === 0) {
        setAssassin("cactu");
        handlePlayerDeath({ playerUid: player.uid, score: player.score });
        return;
      }
  
      setPlayer((prev: any) => {
        if (!prev) return prev;
        const updated = { ...prev, health: newHealth };
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${prev.uid}`), { health: newHealth });
        return updated;
      });
    }
  
    // ⚔️ Ataque com cooldown
    const now = Date.now();
    if (attackPressedRef.current && now - lastAttackTimeRef.current > 500) {
      lastAttackTimeRef.current = now;
  
      handlePlayerAttack(player, otherPlayers,
        // ✅ onPlayerDamaged
        (targetUID, newHealth) => {
          // Atualiza Firebase antes
          update(ref(database, `bugsio/rooms/${roomKey}/players/p${targetUID}`), {
            health: newHealth,
          });

          // Atualiza localmente
          setOtherPlayers((prev) => 
            prev.map((p) => (p.uid === targetUID ? { ...p, health: newHealth } : p))
          );
        },
  
        // ✅ onPlayerKills
        (playerUID, newScore) => {
          setPlayer((prev: any) => {
            const updated = { ...prev, score: newScore };
            update(ref(database, `bugsio/rooms/${roomKey}/players/p${playerUID}`), {
              score: newScore,
            });
            return updated;
          });
        }
      );
    }
  
    // ☠️ Verifica morte
    if (player.health <= 0) {
      setAssassin(player.killer || '');
      handlePlayerDeath({ playerUid: player.uid, score: player.score });
      return;
    }
  
    // 🧭 Atualiza posição do player
    setPlayer((prev: any) => {
      if (!prev) return prev;
      const updatedPlayer = { ...prev, x: newX, y: newY };
      update(ref(database, `bugsio/rooms/${roomKey}/players/p${prev.uid}`), {
        x: newX,
        y: newY,
      });
      return updatedPlayer;
    });
  };
  
  function handlePlayerAttack(
    player: any,
    otherPlayers: any[],
    onPlayerDamaged: (uid: string, newHealth: number) => void,
    onPlayerKills: (uid: string, newScore: number) => void
  ) {
    const attackRange = 50;
    const damagedUIDs = new Set();
  
    otherPlayers.forEach((targetPlayer) => {
      const dist = Math.hypot(targetPlayer.x - player.x, targetPlayer.y - player.y);
      if (dist > attackRange) return;
  
      if (damagedUIDs.has(targetPlayer.uid)) return;
      damagedUIDs.add(targetPlayer.uid);
  
      const playerAttack = player.attack * (player.size / 30);
      const damageToTarget = playerAttack * 1.5;

      const newHealthTarget = Math.max(0, targetPlayer.health - damageToTarget);
      onPlayerDamaged(targetPlayer.uid, newHealthTarget);

      if (targetPlayer.name && newHealthTarget === 0) {
        update(ref(database, `bugsio/rooms/${roomKey}/players/p${targetPlayer.uid}`), {
          killer: player.name,
        });
        const newScore = player.score + 15;
        onPlayerKills(player.uid, newScore);
      }
    });
  }  

  function updatePlayerPosition() {
    let dx = 0, dy = 0
  
    if (isMobile && joystickActive) {
      dx = Math.cos(joystickAngle) * joystickDistance * player.speed
      dy = Math.sin(joystickAngle) * joystickDistance * player.speed
    } else {
      if (keys.up) dy -= player.speed
      if (keys.down) dy += player.speed
      if (keys.left) dx -= player.speed
      if (keys.right) dx += player.speed
  
      if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2)
        dx *= factor
        dy *= factor
      }
    }
  
    const newX = Math.max(0, Math.min(ARENA_SIZE, player.x + dx))
    const newY = Math.max(0, Math.min(ARENA_SIZE, player.y + dy))
    return { newX, newY, dx, dy }
  }

  function handleCactusCollision(x: number, y: number, cactusList: any[], player: any) {
    let tookDamage = false
    let newHealth = player.health;
    const now = Date.now()
  
    for (const cactus of cactusList) {
      // Calcular a distância entre o jogador e o cacto
      const dist = Math.hypot(x - cactus.x, y - cactus.y)
  
      //console.log(`Distância entre jogador e cacto: ${dist}`)
      //console.log(`Raio do jogador: ${player.size / 2}, Raio do cacto: ${cactus.size / 2}`)
  
      // Verifique se a distância entre o jogador e o cacto é menor que a soma dos raios
      if (dist < (player.size / 2 + cactus.size / 2)) {
        //console.log("Colisão detectada!")
        if (!cactus.lastHit || now - cactus.lastHit > 500) {
          cactus.lastHit = now
          newHealth = Math.max(0, player.health - 5)
          tookDamage = true
        }
      }
    }
  
    return {tookDamage, newHealth}
  }    

  function handleFoodCollision(x: number, y: number, foodList: any[], player: any) {
    const updatedFood = [...foodList]
    let foodEaten = false

    for (let i = 0; i < updatedFood.length; i++) {
      const f = updatedFood[i]
      const dist = Math.hypot(x - f.x, y - f.y)

      if (dist < player.size / 2 + f.size / 2) {
        updatedFood.splice(i, 1)
        i--

        updatedFood.push(generateFood(ARENA_SIZE))

        // Restaura a vida do player ao invés de aumentar o tamanho
        const newHealth = Math.min(player.health + FOOD_VALUE_HEATH, player.maxHealth)  // Garante que a vida não ultrapasse o máximo
        const newScore = player.score + FOOD_VALUE_SCORE

        setPlayer((prev: any) => ({
          ...prev,
          health: newHealth,
          score: newScore
        }))

        update(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`), {
          health: newHealth,
          score: newScore
        });

        foodEaten = true

        // 🔁 Atualiza a comida no Realtime Database
        set(ref(database, `bugsio/rooms/${roomKey}/food`), updatedFood)
      }
    }

    return { updatedFood, foodEaten }
  }
  
  const exitGame = () => {
    const confirmExit = window.confirm("Tem certeza que deseja sair da partida? Você ira perder sua pontuação atual.")
    if (confirmExit) {
      handlePlayerDeath({ playerUid: player.uid })
      setAssassin('')
    }
  }

  useEffect(() => monitorConnectionStatus(roomKey, player.uid), [player]);

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
          <div className="text-sm text-green-300">Seu nome: {debugInfo.name}</div>
          <div className="text-sm text-green-300">Players On: {debugInfo.playersCount}</div>
        </div>

        <div className="w-1/3">
          <div className="text-xs text-green-300 mb-1">
            Vida: {Math.floor(player.health)}/{player.maxHealth}
          </div>
          <Progress
            value={(player.health / player.maxHealth) * 100}
            className={`h-2 ${
              (player.health / player.maxHealth) > 0.6
                ? "[&>div]:bg-white"
                : (player.health / player.maxHealth) > 0.3
                ? "[&>div]:bg-orange-500"
                : "[&>div]:bg-red-500"
            }`}
          />
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
          className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-green-900/50 border-2 border-green-500"
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
        <div
          ref={attackButtonRef}
          className="floating-button"
        >
          ⚔️
        </div>      
      )}
    </div>
  )
}
