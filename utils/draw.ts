// Tipos possíveis para o tipo de inseto
type InsectType = "ant" | "spider" | "beetle";
type ViewportOffset = {
  x: number;
  y: number;
};

const ARENA_SIZE = 2000

// Helpers
export const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, offset: { x: number; y: number }) => {
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

export const drawArenaBoundary = (ctx: CanvasRenderingContext2D, offset: { x: number; y: number }) => {
  ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"
  ctx.lineWidth = 3
  ctx.strokeRect(-offset.x, -offset.y, ARENA_SIZE, ARENA_SIZE)
}

export const isInViewport = (x: number, y: number, size: number, canvas: HTMLCanvasElement) =>
  x + size > 0 && x - size < canvas.width && y + size > 0 && y - size < canvas.height

export const drawEntities = (
  ctx: CanvasRenderingContext2D,
  list: any[],
  drawFn: (ctx: CanvasRenderingContext2D, item: any) => void
) => {
  list.forEach((item) => drawFn(ctx, item))
}  

export const drawFood = (ctx: CanvasRenderingContext2D, foodItem: any, viewportOffset: ViewportOffset) => {
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

export const drawBot = (ctx: CanvasRenderingContext2D, bot: any, now: number, viewportOffset: ViewportOffset) => {
  const { x, y, size, type, health, maxHealth, lastDamageTime } = bot
  const screenX = x - viewportOffset.x
  const screenY = y - viewportOffset.y

  if (!isInViewport(screenX, screenY, size, ctx.canvas)) return

  drawInsect(ctx, screenX, screenY, size, type, false)

  // Health bar
  const healthBarWidth = 40 // largura fixa da barra de vida
  const healthBarHeight = 4
  const healthPercent = Math.max(0, Math.min(1, health / maxHealth)) // clamp entre 0 e 1

  const barX = screenX - healthBarWidth / 2
  const barY = screenY - size / 2 - 10 // aparece acima do personagem

  // Fundo da barra (preta semi-transparente)
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
  ctx.fillRect(barX, barY, healthBarWidth, healthBarHeight)

  // Cor de acordo com a porcentagem de vida
  ctx.fillStyle =
  healthPercent >= 0.5
    ? "#4CAF50" // verde
    : healthPercent >= 0.25
    ? "#FFC107" // amarelo
    : "#F44336"; // vermelho

  // Barra de vida proporcional à saúde
  ctx.fillRect(barX, barY, healthBarWidth * healthPercent, healthBarHeight)
}

export const drawPlayer = (ctx: CanvasRenderingContext2D, player: any, now: number, viewportOffset: ViewportOffset) => {
  const { x, y, size, type, lastDamageTime } = player
  const screenX = x - viewportOffset.x
  const screenY = y - viewportOffset.y

  drawInsect(ctx, screenX, screenY, size, type, true)
}

// Add this helper function to draw insect SVGs
export const drawInsect = (
  ctx: any, // Contexto do canvas
  x: number, // Posição x do inseto
  y: number, // Posição y do inseto
  size: number, // Tamanho do inseto
  type: InsectType, // Tipo do inseto (ant, spider, beetle)
  isPlayer: boolean // Se é o jogador (para aplicar o efeito de brilho)
): void => {
  // Save the current context state
  ctx.save()

  // Move to the insect position
  ctx.translate(x, y)

  // Scale based on insect size
  const scale = size / 60 // Base size for SVG
  ctx.scale(scale, scale)

  // Set colors based on insect type
  let fillColor, strokeColor

  if (type === "ant") {
    fillColor = "#FF5722"
    strokeColor = "#D84315"
  } else if (type === "spider") {
    fillColor = "#9C27B0"
    strokeColor = "#6A1B9A"
  } else if (type === "beetle") {
    fillColor = "#3F51B5"
    strokeColor = "#283593"
  }

  // Add glow effect for player
  if (isPlayer) {
    ctx.shadowColor = fillColor
    ctx.shadowBlur = 10
    strokeColor = "#FFFFFF"
  }

  // Draw the insect based on type
  if (type === "ant") {
    // Ant SVG
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2

    // Body (3 segments)
    ctx.beginPath()
    ctx.ellipse(0, 10, 8, 12, 0, 0, Math.PI * 2) // Head
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(0, -5, 6, 8, 0, 0, Math.PI * 2) // Middle
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(0, -20, 10, 12, 0, 0, Math.PI * 2) // Rear
    ctx.fill()
    ctx.stroke()

    // Antennae
    ctx.beginPath()
    ctx.moveTo(-4, 15)
    ctx.quadraticCurveTo(-15, 30, -10, 35)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(4, 15)
    ctx.quadraticCurveTo(15, 30, 10, 35)
    ctx.stroke()

    // Legs (6 legs, 3 on each side)
    // Left legs
    ctx.beginPath()
    ctx.moveTo(-8, 10)
    ctx.lineTo(-25, 15)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-6, 0)
    ctx.lineTo(-25, -5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-10, -15)
    ctx.lineTo(-25, -25)
    ctx.stroke()

    // Right legs
    ctx.beginPath()
    ctx.moveTo(8, 10)
    ctx.lineTo(25, 15)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(6, 0)
    ctx.lineTo(25, -5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(10, -15)
    ctx.lineTo(25, -25)
    ctx.stroke()
  } else if (type === "spider") {
    // Spider SVG
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2

    // Body (2 segments)
    ctx.beginPath()
    ctx.ellipse(0, 0, 12, 12, 0, 0, Math.PI * 2) // Abdomen
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(0, 20, 8, 8, 0, 0, Math.PI * 2) // Head
    ctx.fill()
    ctx.stroke()

    // Eyes
    ctx.fillStyle = "#FFFFFF"
    ctx.beginPath()
    ctx.arc(-3, 18, 2, 0, Math.PI * 2)
    ctx.arc(3, 18, 2, 0, Math.PI * 2)
    ctx.fill()

    // Legs (8 legs, 4 on each side)
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2

    // Left legs
    ctx.beginPath()
    ctx.moveTo(-10, 0)
    ctx.quadraticCurveTo(-25, -15, -35, -5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-12, 5)
    ctx.quadraticCurveTo(-30, 0, -40, 10)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-12, 10)
    ctx.quadraticCurveTo(-30, 20, -40, 25)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-10, 15)
    ctx.quadraticCurveTo(-25, 30, -35, 40)
    ctx.stroke()

    // Right legs
    ctx.beginPath()
    ctx.moveTo(10, 0)
    ctx.quadraticCurveTo(25, -15, 35, -5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(12, 5)
    ctx.quadraticCurveTo(30, 0, 40, 10)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(12, 5)
    ctx.quadraticCurveTo(30, 0, 40, 10)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(12, 10)
    ctx.quadraticCurveTo(30, 20, 40, 25)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(10, 15)
    ctx.quadraticCurveTo(25, 30, 35, 40)
    ctx.stroke()
  } else if (type === "beetle") {
    // Beetle SVG
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2

    // Body
    ctx.beginPath()
    ctx.ellipse(0, 0, 20, 25, 0, 0, Math.PI * 2) // Main body
    ctx.fill()
    ctx.stroke()

    // Head
    ctx.beginPath()
    ctx.ellipse(0, 20, 8, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Shell pattern
    ctx.beginPath()
    ctx.moveTo(-10, 0)
    ctx.lineTo(10, 0)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, -20)
    ctx.lineTo(0, 15)
    ctx.stroke()

    // Antennae
    ctx.beginPath()
    ctx.moveTo(-5, 25)
    ctx.lineTo(-15, 35)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(5, 25)
    ctx.lineTo(15, 35)
    ctx.stroke()

    // Legs (6 legs, 3 on each side)
    // Left legs
    ctx.beginPath()
    ctx.moveTo(-18, 10)
    ctx.lineTo(-30, 15)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-20, 0)
    ctx.lineTo(-35, -5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-18, -10)
    ctx.lineTo(-30, -20)
    ctx.stroke()

    // Right legs
    ctx.beginPath()
    ctx.moveTo(18, 10)
    ctx.lineTo(30, 15)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(20, 0)
    ctx.lineTo(35, -5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(18, -10)
    ctx.lineTo(30, -20)
    ctx.stroke()
  }

  // Restore the context
  ctx.restore()
}
