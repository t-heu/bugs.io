"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useMobile } from "@/hooks/use-mobile"

import { drawArenaBoundary, drawEntities, drawFood, drawGrid, drawPlayer } from "@/utils/draw"
import {  generateInitialFood, generateFood } from "@/utils/food"
import { database, set, ref, update, off, onValue } from "@/api/firebase"
import { monitorConnectionStatus, exitPlayer } from "@/utils/monitorConnection"

// Game constants
const ARENA_SIZE = 2000
const VIEWPORT_SIZE = 800
const FOOD_COUNT = 100
const FOOD_VALUE = 10

export default function GameArena({ onGameOver, roomKey, player, setPlayer }: any) {
  const canvasRef = useRef(null)
  const gameInitializedRef = useRef(false)
  const frameCountRef = useRef(0)
  const joystickRef = useRef(null)

  const [food, setFood] = useState<any>([])
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false })
  const [gameRunning, setGameRunning] = useState(true)
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })

  const isMobile = useMobile()
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [joystickAngle, setJoystickAngle] = useState(0)
  const [joystickDistance, setJoystickDistance] = useState(0)
  const [debugInfo, setDebugInfo] = useState({ botCount: 0, frameCount: 0, playerHealth: 0, playersCount: 0 })
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])

  // 🔁 Inicializa o jogo uma única vez
  useEffect(() => {
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true
  
    // Gera comida e salva localmente
    const initialFood = generateInitialFood(FOOD_COUNT, ARENA_SIZE)
    setFood(initialFood)
  
    // 🔁 Salva comida no Firebase
    set(ref(database, `bugsio/rooms/${roomKey}/food`), initialFood)
  }, [])

  useEffect(() => {
    if (!roomKey || !player.uid) return
  
    const playerRef = ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`)
  
    update(playerRef, {
      x: player.x,
      y: player.y,
      health: player.health,
      score: player.score,
      lastDamageTime: player.lastDamageTime,
    })
  }, [player, roomKey])
  
  useEffect(() => {
    if (!roomKey) return;
  
    const playersRef = ref(database, `bugsio/rooms/${roomKey}/players`);
  
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const playersData = snapshot.val() || {};
      const otherPlayers = Object.values(playersData).filter(
        (p: any) => p.uid !== player.uid
      );
  
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
      const deltaTime = (timestamp - lastTime) / 1000
      lastTime = timestamp

      frameCountRef.current += 1
      if (frameCountRef.current % 30 === 0) {
        // Atualizar a cada 30 frames
        setDebugInfo((prev) => ({
          ...prev,
          frameCount: frameCountRef.current,
          botCount: 0,//bots.length,
          playersCount: otherPlayers.length,
          playerHealth: Math.floor(player.health),
        }))
      }

      updateGame(deltaTime)
      renderGame()

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameRunning, player, food, keys, joystickActive, joystickAngle, joystickDistance])

  // teclado
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      const key = e.key.toLowerCase();
      if (key === "w" || e.key === "ArrowUp") setKeys((prev) => ({ ...prev, up: true }));
      if (key === "s" || e.key === "ArrowDown") setKeys((prev) => ({ ...prev, down: true }));
      if (key === "a" || e.key === "ArrowLeft") setKeys((prev) => ({ ...prev, left: true }));
      if (key === "d" || e.key === "ArrowRight") setKeys((prev) => ({ ...prev, right: true }));
    };
    
    const handleKeyUp = (e: any) => {
      const key = e.key.toLowerCase();
      if (key === "w" || e.key === "ArrowUp") setKeys((prev) => ({ ...prev, up: false }));
      if (key === "s" || e.key === "ArrowDown") setKeys((prev) => ({ ...prev, down: false }));
      if (key === "a" || e.key === "ArrowLeft") setKeys((prev) => ({ ...prev, left: false }));
      if (key === "d" || e.key === "ArrowRight") setKeys((prev) => ({ ...prev, right: false }));
    };
    
    // Adicionando os event listeners para as teclas pressionadas
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    // Cleanup: Removendo os event listeners quando o componente for desmontado
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Mobile joystick controls
  useEffect(() => {
    if (!isMobile || !joystickRef.current) return

    const joystickElement: any = joystickRef.current
    const joystickRect = joystickElement.getBoundingClientRect()
    const centerX = joystickRect.width / 2
    const centerY = joystickRect.height / 2
    const maxDistance = joystickRect.width / 2

    const handleTouchStart = (e: any) => {
      e.preventDefault()
      setJoystickActive(true)
    }

    const handleTouchMove = (e: any) => {
      if (!joystickActive) return
      e.preventDefault()

      const touch = e.touches[0]
      const rect = joystickElement.getBoundingClientRect()

      // Calculate joystick position relative to center
      const x = touch.clientX - rect.left - centerX
      const y = touch.clientY - rect.top - centerY

      // Calculate distance and angle
      const distance = Math.min(Math.sqrt(x * x + y * y), maxDistance)
      const angle = Math.atan2(y, x)

      // Normalize distance to 0-1 range
      const normalizedDistance = distance / maxDistance

      setJoystickPos({ x, y })
      setJoystickAngle(angle)
      setJoystickDistance(normalizedDistance)
    }

    const handleTouchEnd = (e: any) => {
      e.preventDefault()
      setJoystickActive(false)
      setJoystickPos({ x: 0, y: 0 })
      setJoystickAngle(0)
      setJoystickDistance(0)
    }

    joystickElement.addEventListener("touchstart", handleTouchStart)
    joystickElement.addEventListener("touchmove", handleTouchMove)
    joystickElement.addEventListener("touchend", handleTouchEnd)

    return () => {
      joystickElement.removeEventListener("touchstart", handleTouchStart)
      joystickElement.removeEventListener("touchmove", handleTouchMove)
      joystickElement.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMobile, joystickActive])

  const updateGame = (deltaTime: number) => {
    if (!canvasRef.current) return
  
    // Atualiza posição do player
    const { newX, newY } = updatePlayerPosition()
  
    // Atualiza offset da câmera
    setViewportOffset({
      x: newX - VIEWPORT_SIZE / 2,
      y: newY - VIEWPORT_SIZE / 2,
    })
  
    // Verifica colisão com comida
    const { updatedFood, foodEaten } = handleFoodCollision(newX, newY, food, player)
  
    if (foodEaten) {
      setFood(updatedFood)
    }

    // Verifica colisões entre o player e outros jogadores
    otherPlayers.forEach((otherPlayer) => {
      handlePlayerVsPlayerCollision(player, otherPlayer, (newHealthPlayer1: any) => {
        setPlayer((prev: any) => ({ ...prev, health: newHealthPlayer1 }));
      }, (newHealthPlayer2: any) => {
        // Atualiza a saúde do outro jogador no estado
        const updatedOtherPlayers = otherPlayers.map((p) =>
          p.uid === otherPlayer.uid ? { ...p, health: newHealthPlayer2 } : p
        );
        setOtherPlayers(updatedOtherPlayers);
      });
    });
    
    // Verifica se o player morreu
    if (player.health <= 0) {
      exitPlayer(roomKey,  player.uid)
      setPlayer(null)
      setGameRunning(false)
      onGameOver(player.score)
      return
    }
    
    // Atualiza a posição do player e localmente
    setPlayer((prev: any) => {
      const updatedPlayer = {
        ...prev,
        x: newX,
        y: newY,
      }

      // Atualiza no banco também
      set(ref(database, `bugsio/rooms/${roomKey}/players/p${player.uid}`), updatedPlayer)

      return updatedPlayer
    })
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
        const newHealth = Math.min(player.health + FOOD_VALUE, player.maxHealth)  // Garante que a vida não ultrapasse o máximo
        const newScore = player.score + FOOD_VALUE

        setPlayer((prev: any) => ({
          ...prev,
          health: newHealth,
          score: newScore
        }))

        foodEaten = true

        // 🔁 Atualiza a comida no Realtime Database
        set(ref(database, `bugsio/rooms/${roomKey}/food`), updatedFood)
      }
    }

    return { updatedFood, foodEaten }
  }

  function handlePlayerVsPlayerCollision(player1: any, player2: any, onPlayer1Damaged: any, onPlayer2Damaged: any) {
    // Calcular a distância entre os dois jogadores
    const dist = Math.hypot(player2.x - player1.x, player2.y - player1.y);
    
    // Debug: Mostrando a distância
    //console.log(`Distância entre Jogador 1 e Jogador 2: ${dist}`);
    
    // Raio de colisão (metade do tamanho de cada jogador)
    const player1Radius = player1.size / 2;
    const player2Radius = player2.size / 2;
    
    // Verificar se a colisão ocorreu
    if (dist < player1Radius + player2Radius) {
      //console.log("Colisão detectada entre os jogadores!");
  
      // Calcular o dano do Jogador 1 para o Jogador 2
      const player1Attack = player1.attack * (player1.size / 30);
      const damageToPlayer2 = player1Attack * 1.5; // Dano do jogador 1 no jogador 2
  
      // Atualizar saúde do Jogador 2
      const newHealthPlayer2 = Math.max(0, player2.health - damageToPlayer2);
      onPlayer2Damaged(newHealthPlayer2);
      
      // Calcular o dano do Jogador 2 para o Jogador 1
      const player2Attack = player2.attack * (player2.size / 30);
      const damageToPlayer1 = player2Attack * 1.5; // Dano do jogador 2 no jogador 1
  
      // Atualizar saúde do Jogador 1
      const newHealthPlayer1 = Math.max(0, player1.health - damageToPlayer1);
      onPlayer1Damaged(newHealthPlayer1);
  
      // Empurrar os jogadores para longe um do outro para evitar sobreposição
      const angle = Math.atan2(player2.y - player1.y, player2.x - player1.x);
      const pushDistance = (player1Radius + player2Radius - dist) / 2;
      
      // Empurrando os jogadores
      player1.x -= Math.cos(angle) * pushDistance;
      player1.y -= Math.sin(angle) * pushDistance;
  
      player2.x += Math.cos(angle) * pushDistance;
      player2.y += Math.sin(angle) * pushDistance;
    }
  }

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
    otherPlayers.forEach(p => {
      drawPlayer(ctx, p, now, viewportOffset, false)
    })
    drawPlayer(ctx, player, now, viewportOffset, true)
  }

  useEffect(() => {
    monitorConnectionStatus(roomKey, player.uid)
  }, [player]);

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
          <div className="text-sm text-green-300">Bots: {debugInfo.botCount}</div>
          <div className="text-sm text-green-300">Players: {debugInfo.playersCount}</div>
        </div>

        <div className="w-1/3">
          <div className="text-xs text-green-300 mb-1">
            Vida: {Math.floor(player.health)}/{player.maxHealth}
          </div>
          <Progress value={(player.health / player.maxHealth) * 100} className="h-2" />
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="text-green-300 hover:text-white hover:bg-green-800"
            onClick={() => {
              setGameRunning(false)
              onGameOver(player.score)
            }}
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
    </div>
  )
}
