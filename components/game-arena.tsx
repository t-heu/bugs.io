"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useMobile } from "@/hooks/use-mobile"

import { drawInsect } from "@/utils/drawInsect"
import { createBot, spawnBotsNearPlayer } from "@/logic/bot"

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

export default function GameArena({ character, onGameOver }: any) {
  const canvasRef = useRef(null)
  const gameInitializedRef = useRef(false)
  const [player, setPlayer] = useState({
    x: ARENA_SIZE / 2,
    y: ARENA_SIZE / 2,
    size: 30,
    speed: character.stats.speed * 0.5,
    attack: character.stats.attack,
    health: character.stats.health * 10,
    maxHealth: character.stats.health * 10,
    score: 0,
    type: character.id,
    lastDamageTime: 0, // Para efeito visual de dano
  })

  const [food, setFood] = useState([])
  const [bots, setBots] = useState([])
  const [keys, setKeys] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  })
  const [gameRunning, setGameRunning] = useState(true)
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })
  const isMobile = useMobile()
  const joystickRef = useRef(null)
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [joystickAngle, setJoystickAngle] = useState(0)
  const [joystickDistance, setJoystickDistance] = useState(0)
  const [debugInfo, setDebugInfo] = useState({ botCount: 0, frameCount: 0, playerHealth: 0 })
  const frameCountRef = useRef(0)

  // Initialize game
  useEffect(() => {
    if (gameInitializedRef.current) return
    gameInitializedRef.current = true

    console.log("Inicializando jogo...")

    // Generate food
    const initialFood: any = []
    for (let i = 0; i < FOOD_COUNT; i++) {
      initialFood.push({
        x: Math.random() * ARENA_SIZE,
        y: Math.random() * ARENA_SIZE,
        size: 5 + Math.random() * 5,
        color: `hsl(${Math.random() * 60 + 80}, 70%, 50%)`,
      })
    }
    setFood(initialFood)

  }, [character.id, character.stats.attack, character.stats.health, character.stats.speed])

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

    // Limitar deltaTime para evitar saltos grandes quando a aba está em segundo plano
    const cappedDeltaTime = Math.min(deltaTime, 0.1)
    const now = Date.now()

    // Update player position based on keyboard or joystick
    let dx = 0
    let dy = 0

    if (isMobile && joystickActive) {
      dx = Math.cos(joystickAngle) * joystickDistance * player.speed
      dy = Math.sin(joystickAngle) * joystickDistance * player.speed
    } else {
      if (keys.up) dy -= player.speed
      if (keys.down) dy += player.speed
      if (keys.left) dx -= player.speed
      if (keys.right) dx += player.speed

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2)
        dx *= factor
        dy *= factor
      }
    }

    // Update player position
    const newX = Math.max(0, Math.min(ARENA_SIZE, player.x + dx))
    const newY = Math.max(0, Math.min(ARENA_SIZE, player.y + dy))

    // Update viewport offset to center on player
    const newViewportOffset = {
      x: newX - VIEWPORT_SIZE / 2,
      y: newY - VIEWPORT_SIZE / 2,
    }

    // Check food collision
    const newFood: any = [...food]
    let foodEaten = false

    for (let i = 0; i < newFood.length; i++) {
      const f: any = newFood[i]
      const distance = Math.sqrt(Math.pow(newX - f.x, 2) + Math.pow(newY - f.y, 2))

      if (distance < player.size / 2 + f.size / 2) {
        // Player ate food
        newFood.splice(i, 1)
        i--

        // Add new food at random location
        newFood.push({
          x: Math.random() * ARENA_SIZE,
          y: Math.random() * ARENA_SIZE,
          size: 5 + Math.random() * 5,
          color: `hsl(${Math.random() * 60 + 80}, 70%, 50%)`,
        })

        // Grow player (com limite de tamanho)
        const newSize = Math.min(player.size + GROWTH_FACTOR * FOOD_VALUE, MAX_PLAYER_SIZE)
        const newScore = player.score + FOOD_VALUE

        setPlayer((prev) => ({
          ...prev,
          size: newSize,
          score: newScore,
        }))

        foodEaten = true
      }
    }

    if (foodEaten) {
      setFood(newFood)
    }

    // Update bots
    const newBots: any = [...bots]

    for (let i = 0; i < newBots.length; i++) {
      const bot: any = newBots[i]

      // Forçar movimento constante para todos os bots
      const moveSpeed = bot.speed

      // Bot AI - simplificado para movimento mais consistente
      if (bot.directionChangeTime <= 0) {
        // Mudar direção aleatoriamente a cada poucos segundos
        bot.direction = Math.random() * Math.PI * 2
        bot.directionChangeTime = 3 + Math.random() * 2
      } else {
        bot.directionChangeTime -= cappedDeltaTime
      }

      // Mover bot na direção atual
      const botDx = Math.cos(bot.direction) * moveSpeed
      const botDy = Math.sin(bot.direction) * moveSpeed

      // Atualizar posição com verificação de limites
      const newBotX = Math.max(0, Math.min(ARENA_SIZE, bot.x + botDx))
      const newBotY = Math.max(0, Math.min(ARENA_SIZE, bot.y + botDy))

      // Se o bot atingir a borda, mudar de direção
      if (newBotX <= 0 || newBotX >= ARENA_SIZE || newBotY <= 0 || newBotY >= ARENA_SIZE) {
        bot.direction = Math.random() * Math.PI * 2
      }

      bot.x = newBotX
      bot.y = newBotY
      bot.lastMoved = now

      // Check food collision for bots
      for (let j = 0; j < newFood.length; j++) {
        const f = newFood[j]
        const distance = Math.sqrt(Math.pow(bot.x - f.x, 2) + Math.pow(bot.y - f.y, 2))

        if (distance < bot.size / 2 + f.size / 2) {
          // Bot ate food
          newFood.splice(j, 1)
          j--

          // Add new food at random location
          newFood.push({
            x: Math.random() * ARENA_SIZE,
            y: Math.random() * ARENA_SIZE,
            size: 5 + Math.random() * 5,
            color: `hsl(${Math.random() * 60 + 80}, 70%, 50%)`,
          })

          // Grow bot (com limite de tamanho)
          bot.size = Math.min(bot.size + GROWTH_FACTOR * FOOD_VALUE, MAX_BOT_SIZE)
        }
      }

      // Check player-bot collision
      const playerBotDistance = Math.sqrt(Math.pow(newX - bot.x, 2) + Math.pow(newY - bot.y, 2))

      if (playerBotDistance < player.size / 2 + bot.size / 2) {
        // Combat!
        const playerAttackValue = player.attack * (player.size / 30)
        const botAttackValue = bot.attack * (bot.size / 30)

        // Aplicar dano direto ao colidir (sem deltaTime)
        bot.health -= playerAttackValue * DAMAGE_MULTIPLIER
        bot.lastDamageTime = now

        const newPlayerHealth = Math.max(0, player.health - botAttackValue * DAMAGE_MULTIPLIER)

        setPlayer((prev) => ({
          ...prev,
          health: newPlayerHealth,
          lastDamageTime: now,
        }))

        // Push away from each other
        const angle = Math.atan2(bot.y - newY, bot.x - newX)
        const pushDistance = (player.size / 2 + bot.size / 2 - playerBotDistance) / 2

        bot.x += Math.cos(angle) * pushDistance
        bot.y += Math.sin(angle) * pushDistance

        // Check if bot died
        if (bot.health <= 0) {
          // Remove bot
          newBots.splice(i, 1)
          i--

          // Player gets points for killing bot
          const scoreGain = Math.floor(bot.size)
          setPlayer((prev) => ({
            ...prev,
            score: prev.score + scoreGain,
            size: Math.min(prev.size + (GROWTH_FACTOR * scoreGain) / 2, MAX_PLAYER_SIZE),
          }))

          // Add new bot
          const angle = Math.random() * Math.PI * 2
          const distance = 300 + Math.random() * 200
          const x = newX + Math.cos(angle) * distance
          const y = newY + Math.sin(angle) * distance

          newBots.push(createBot(Math.max(0, Math.min(ARENA_SIZE, x)), Math.max(0, Math.min(ARENA_SIZE, y))))
        }
      }
    }

    // Check if player died
    if (player.health <= 0) {
      setGameRunning(false)
      onGameOver(player.score)
      return
    }

    // Update state
    setPlayer((prev) => ({
      ...prev,
      x: newX,
      y: newY,
    }))

    setBots(newBots)
    setViewportOffset(newViewportOffset)
  }

  const renderGame = () => {
    const canvas: any = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1

    const gridSize = 50
    const offsetX = viewportOffset.x % gridSize
    const offsetY = viewportOffset.y % gridSize

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

    // Draw arena boundary
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"
    ctx.lineWidth = 3
    ctx.strokeRect(-viewportOffset.x, -viewportOffset.y, ARENA_SIZE, ARENA_SIZE)

    // Draw food
    food.forEach((f: any) => {
      const screenX = f.x - viewportOffset.x
      const screenY = f.y - viewportOffset.y

      // Only draw if in viewport
      if (
        screenX + f.size > 0 &&
        screenX - f.size < canvas.width &&
        screenY + f.size > 0 &&
        screenY - f.size < canvas.height
      ) {
        ctx.fillStyle = f.color
        ctx.beginPath()
        ctx.arc(screenX, screenY, f.size, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Draw bots
    const now = Date.now()
    bots.forEach((bot: any) => {
      const screenX = bot.x - viewportOffset.x
      const screenY = bot.y - viewportOffset.y

      // Only draw if in viewport
      if (
        screenX + bot.size > 0 &&
        screenX - bot.size < canvas.width &&
        screenY + bot.size > 0 &&
        screenY - bot.size < canvas.height
      ) {
        // Efeito de dano (vermelho pulsante quando recebe dano)
        if (now - bot.lastDamageTime < 300) {
          ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
          ctx.beginPath()
          ctx.arc(screenX, screenY, bot.size * 1.2, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw insect SVG based on type
        drawInsect(ctx, screenX, screenY, bot.size, bot.type, false)

        // Draw health bar
        const healthBarWidth = bot.size
        const healthBarHeight = 4
        const healthPercent = bot.health / bot.maxHealth

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(screenX - healthBarWidth / 2, screenY - bot.size / 2 - 10, healthBarWidth, healthBarHeight)

        ctx.fillStyle = healthPercent > 0.5 ? "#4CAF50" : healthPercent > 0.25 ? "#FFC107" : "#F44336"
        ctx.fillRect(
          screenX - healthBarWidth / 2,
          screenY - bot.size / 2 - 10,
          healthBarWidth * healthPercent,
          healthBarHeight,
        )
      }
    })

    // Draw player
    const screenX = player.x - viewportOffset.x
    const screenY = player.y - viewportOffset.y

    // Efeito de dano para o jogador
    if (now - player.lastDamageTime < 300) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
      ctx.beginPath()
      ctx.arc(screenX, screenY, player.size * 1.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw player insect SVG
    drawInsect(ctx, screenX, screenY, player.size, player.type, true)
  }

  // Botão para adicionar mais bots (para teste)
  const addMoreBots = () => {
    spawnBotsNearPlayer(player, bots, setBots, BOT_COUNT, ARENA_SIZE)
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
          <Button className="bg-green-600 hover:bg-green-500" onClick={addMoreBots}>
            + Bots
          </Button>
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
