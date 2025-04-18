"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useMobile } from "@/hooks/use-mobile"

import { drawInsect } from "@/utils/drawInsect"
import { createBot, generateInitialFood, generateInitialBots } from "@/logic/bots-and-food"

// Game constants
const ARENA_SIZE = 2000
const VIEWPORT_SIZE = 800
const FOOD_COUNT = 100
const BOT_COUNT = 15 // Aumentei o número de bots para garantir visibilidade
const FOOD_VALUE = 10
const GROWTH_FACTOR = 0.05 // Reduzido para evitar crescimento excessivo
const MAX_BOT_SIZE = 60 // Tamanho máximo para os bots
const MAX_PLAYER_SIZE = 80 // Tamanho máximo para o jogador
const DAMAGE_MULTIPLIER = 5 // Multiplicador de dano para tornar o combate mais impactant

export default function GameArena({ characters, character, onGameOver }: any) {
  const canvasRef = useRef(null)
  const gameInitializedRef = useRef(false)
  const frameCountRef = useRef(0)
  const joystickRef = useRef(null)

  const [player, setPlayer] = useState(() => ({
    x: ARENA_SIZE / 2,
    y: ARENA_SIZE / 2,
    size: 30,
    speed: character.stats.speed * 0.5,
    attack: character.stats.attack,
    health: character.stats.health * 10,
    maxHealth: character.stats.health * 10,
    score: 0,
    type: character.id,
    lastDamageTime: 0,
  }))

  const [food, setFood] = useState([])
  const [bots, setBots] = useState([])

  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false })
  const [gameRunning, setGameRunning] = useState(true)
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })

  const isMobile = useMobile()
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [joystickAngle, setJoystickAngle] = useState(0)
  const [joystickDistance, setJoystickDistance] = useState(0)
  const [debugInfo, setDebugInfo] = useState({ botCount: 0, frameCount: 0, playerHealth: 0 })

  // 🔁 Inicializa o jogo uma única vez
  useEffect(() => {
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true

    console.log("Inicializando jogo...")

    setFood(generateInitialFood(FOOD_COUNT, ARENA_SIZE))
    setBots(generateInitialBots(BOT_COUNT, ARENA_SIZE, characters))
  }, [])

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
          botCount: bots.length,
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
  }, [gameRunning, player, food, bots, keys, joystickActive, joystickAngle, joystickDistance])

  // teclado
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "w" || e.key === "ArrowUp") setKeys((prev) => ({ ...prev, up: true }));
      if (e.key === "s" || e.key === "ArrowDown") setKeys((prev) => ({ ...prev, down: true }));
      if (e.key === "a" || e.key === "ArrowLeft") setKeys((prev) => ({ ...prev, left: true }));
      if (e.key === "d" || e.key === "ArrowRight") setKeys((prev) => ({ ...prev, right: true }));
    };
    
    const handleKeyUp = (e: any) => {
      if (e.key === "w" || e.key === "ArrowUp") setKeys((prev) => ({ ...prev, up: false }));
      if (e.key === "s" || e.key === "ArrowDown") setKeys((prev) => ({ ...prev, down: false }));
      if (e.key === "a" || e.key === "ArrowLeft") setKeys((prev) => ({ ...prev, left: false }));
      if (e.key === "d" || e.key === "ArrowRight") setKeys((prev) => ({ ...prev, right: false }));
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
  
    const cappedDeltaTime = Math.min(deltaTime, 0.1)
    const now = Date.now()
  
    // Atualiza posição do player
    const { newX, newY, dx, dy } = updatePlayerPosition(cappedDeltaTime)
  
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
  
    const updatedBots = updateBots({
      bots,
      food: updatedFood,
      player,
      newX,
      newY,
      cappedDeltaTime,
      now,
      onBotKilled: (scoreGain) => {
        setPlayer(prev => ({
          ...prev,
          score: prev.score + scoreGain,
          size: Math.min(prev.size + (GROWTH_FACTOR * scoreGain) / 2, MAX_PLAYER_SIZE)
        }))
      },
      onPlayerDamaged: (newHealth) => {
        setPlayer(prev => ({
          ...prev,
          health: newHealth,
          lastDamageTime: now
        }))
      }
    })
    
    // Agora vamos modificar a lógica de atualização dos bots:
    
    setBots((prevBots) => {
      const botsToUpdate = prevBots.filter((bot) => bot.health > 0) // Remove bots mortos
      updatedBots.forEach((bot) => {
        // Se o bot não existir na lista de bots (pela ID), adiciona ele
        if (!botsToUpdate.some(existingBot => existingBot.id === bot.id)) {
          botsToUpdate.push(bot)
        }
      })
    
      // Verifica se o número de bots é menor que 1, se sim, adiciona um novo bot
      if (botsToUpdate.length < BOT_COUNT) {
        const angle = Math.random() * Math.PI * 2
        const dist = 300 + Math.random() * 200
        const x = newX + Math.cos(angle) * dist
        const y = newY + Math.sin(angle) * dist
    
        const newBot = createBot(
          Math.max(0, Math.min(ARENA_SIZE, x)),
          Math.max(0, Math.min(ARENA_SIZE, y)),
          characters
        )
    
        botsToUpdate.push(newBot) // Adiciona o novo bot
      }
    
      return botsToUpdate // Atualiza o estado com os bots existentes e o novo bot, se necessário
    })
    
    // Verifica se o player morreu
    if (player.health <= 0) {
      setGameRunning(false)
      onGameOver(player.score)
      return
    }
    
    // Atualiza a posição do player
    setPlayer(prev => ({
      ...prev,
      x: newX,
      y: newY,
    }))
    
  }    

  function generateFood() {
    return {
      x: Math.random() * ARENA_SIZE,
      y: Math.random() * ARENA_SIZE,
      size: 5 + Math.random() * 5,
      color: `hsl(${Math.random() * 60 + 80}, 70%, 50%)`,
    }
  }  

  function updatePlayerPosition(delta: number) {
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

            updatedFood.push(generateFood())

            // Restaura a vida do player ao invés de aumentar o tamanho
            const newHealth = Math.min(player.health + FOOD_VALUE, player.maxHealth)  // Garante que a vida não ultrapasse o máximo
            const newScore = player.score + FOOD_VALUE

            setPlayer(prev => ({
                ...prev,
                health: newHealth,
                score: newScore
            }))

            foodEaten = true
        }
    }

    return { updatedFood, foodEaten }
  }

  function updateBots({
    bots,
    food,
    player,
    newX,
    newY,
    cappedDeltaTime,
    now,
    onBotKilled,
    onPlayerDamaged
  }) {
    const updatedBots = [...bots]
  
    let botsToSpawn = 0
    for (let i = 0; i < updatedBots.length; i++) {
      const bot = updatedBots[i]
  
      if (bot.directionChangeTime <= 0) {
        bot.direction = Math.random() * Math.PI * 2
        bot.directionChangeTime = 3 + Math.random() * 2
      } else {
        bot.directionChangeTime -= cappedDeltaTime
      }
  
      const moveSpeed = bot.speed
      const botDx = Math.cos(bot.direction) * moveSpeed
      const botDy = Math.sin(bot.direction) * moveSpeed
  
      bot.x = Math.max(0, Math.min(ARENA_SIZE, bot.x + botDx))
      bot.y = Math.max(0, Math.min(ARENA_SIZE, bot.y + botDy))
      bot.lastMoved = now
  
      if (bot.x <= 0 || bot.x >= ARENA_SIZE || bot.y <= 0 || bot.y >= ARENA_SIZE) {
        bot.direction = Math.random() * Math.PI * 2
      }
  
      // Bot colide com comida
      for (let j = 0; j < food.length; j++) {
        const f = food[j]
        const distance = Math.hypot(bot.x - f.x, bot.y - f.y)

        if (distance < bot.size / 2 + f.size / 2) {
          food.splice(j, 1)
          j--
          food.push(generateFood())

          // Em vez de aumentar o tamanho, restaura a vida do bot
          bot.health = Math.min(bot.health + FOOD_VALUE, bot.maxHealth) // evita passar do máximo
        }
      }
  
      // Colisão com player
      const dist = Math.hypot(newX - bot.x, newY - bot.y)
  
      if (dist < player.size / 2 + bot.size / 2) {
        const playerAttack = player.attack * (player.size / 30)
        const botAttack = bot.attack * (bot.size / 30)

        // Dano no bot: proporcional ao ataque do player
        bot.health -= playerAttack * DAMAGE_MULTIPLIER
        bot.lastDamageTime = now

        // Dano no player: escalado com o tamanho do bot, e dividido pela vida do player
        const rawDamage = botAttack * DAMAGE_MULTIPLIER
        const scaledDamage = rawDamage * (bot.size / player.size) // reduz dano de bots pequenos em players grandes
        const newPlayerHealth = Math.max(0, player.health - scaledDamage)

        onPlayerDamaged(newPlayerHealth)

        const angle = Math.atan2(bot.y - newY, bot.x - newX)
        const push = (player.size / 2 + bot.size / 2 - dist) / 2
        bot.x += Math.cos(angle) * push
        bot.y += Math.sin(angle) * push

        if (bot.health <= 0) {
          updatedBots.splice(i, 1)
          i--
          onBotKilled(Math.floor(bot.size))
          botsToSpawn++ // marca que precisa repor
        }
      }
    }

    for (let i = 0; i < botsToSpawn; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 300 + Math.random() * 200
      const x = newX + Math.cos(angle) * dist
      const y = newY + Math.sin(angle) * dist
    
      const newBot = createBot(
        Math.max(0, Math.min(ARENA_SIZE, x)),
        Math.max(0, Math.min(ARENA_SIZE, y)),
        characters
      )
    
      updatedBots.push(newBot)
    }
  
    return updatedBots
  }  

  const renderGame = () => {
    const canvas: HTMLCanvasElement | null = canvasRef.current
    if (!canvas) return
  
    const ctx = canvas.getContext("2d")
    if (!ctx) return
  
    const now = Date.now()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  
    drawGrid(ctx, canvas, viewportOffset)
    drawArenaBoundary(ctx, viewportOffset)
    drawEntities(ctx, food, drawFood)
    drawEntities(ctx, bots, (ctx, bot) => drawBot(ctx, bot, now))
    drawPlayer(ctx, player, now)
  }
  
  // Helpers
  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, offset: { x: number; y: number }) => {
    const gridSize = 50
    const offsetX = offset.x % gridSize
    const offsetY = offset.y % gridSize
  
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
  
    for (let x = -offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
  
    for (let y = -offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
  }
  
  const drawArenaBoundary = (ctx: CanvasRenderingContext2D, offset: { x: number; y: number }) => {
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"
    ctx.lineWidth = 3
    ctx.strokeRect(-offset.x, -offset.y, ARENA_SIZE, ARENA_SIZE)
  }
  
  const isInViewport = (x: number, y: number, size: number, canvas: HTMLCanvasElement) =>
    x + size > 0 && x - size < canvas.width && y + size > 0 && y - size < canvas.height
  
  const drawEntities = (
    ctx: CanvasRenderingContext2D,
    list: any[],
    drawFn: (ctx: CanvasRenderingContext2D, item: any) => void
  ) => {
    list.forEach((item) => drawFn(ctx, item))
  }  
  
  const drawFood = (ctx: CanvasRenderingContext2D, foodItem: any) => {
    if (!foodItem || typeof foodItem.x !== 'number' || typeof foodItem.y !== 'number') return
  
    const { x, y, size, color } = foodItem
    const screenX = x - viewportOffset.x
    const screenY = y - viewportOffset.y
  
    if (!isInViewport(screenX, screenY, size, ctx.canvas)) return
  
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(screenX, screenY, size, 0, Math.PI * 2)
    ctx.fill()
  }  
  
  const drawBot = (ctx: CanvasRenderingContext2D, bot: any, now: number) => {
    const { x, y, size, type, health, maxHealth, lastDamageTime } = bot
    const screenX = x - viewportOffset.x
    const screenY = y - viewportOffset.y
  
    if (!isInViewport(screenX, screenY, size, ctx.canvas)) return
  
    drawInsect(ctx, screenX, screenY, size, type, false)
  
    // Health bar
    const healthBarWidth = 30 // largura fixa da barra de vida
    const healthBarHeight = 4
    const healthPercent = Math.max(0, Math.min(1, health / maxHealth)) // clamp entre 0 e 1

    const barX = screenX - healthBarWidth / 2
    const barY = screenY - size / 2 - 10 // aparece acima do personagem

    // Fundo da barra (preta semi-transparente)
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(barX, barY, healthBarWidth, healthBarHeight)

    // Cor de acordo com a porcentagem de vida
    ctx.fillStyle = healthPercent > 0.5 ? "#4CAF50" : healthPercent > 0.25 ? "#FFC107" : "#F44336"

    // Barra de vida proporcional à saúde
    ctx.fillRect(barX, barY, healthBarWidth * healthPercent, healthBarHeight)

  }
  
  const drawPlayer = (ctx: CanvasRenderingContext2D, player: any, now: number) => {
    const { x, y, size, type, lastDamageTime } = player
    const screenX = x - viewportOffset.x
    const screenY = y - viewportOffset.y
  
    /*if (now - lastDamageTime < 300) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
      ctx.beginPath()
      ctx.arc(screenX, screenY, size * 1.2, 0, Math.PI * 2)
      ctx.fill()
    }*/
  
    drawInsect(ctx, screenX, screenY, size, type, true)
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
          <div className="text-sm text-green-300">Tamanho: {Math.floor(player.size)}</div>
          <div className="text-sm text-green-300">Bots: {debugInfo.botCount}</div>
          <div className="text-sm text-green-300">Vida: {debugInfo.playerHealth}</div>
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
