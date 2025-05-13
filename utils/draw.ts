import insects from "@/insects.json"
import { ARENA_SIZE } from "@/utils/game-constants"
import { insectDrawingComponents, InsectType } from "@/app/insects";

type ViewportOffset = {
  x: number;
  y: number;
};

// Helpers
export const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, offset: ViewportOffset) => {
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

export const drawArenaBoundary = (ctx: CanvasRenderingContext2D, offset: ViewportOffset) => {
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

  const stemHeight = size * 2
  const leafSize = size * 0.8

  // 🌱 Draw stem
  ctx.strokeStyle = "#4CAF50"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(screenX, screenY)
  ctx.lineTo(screenX, screenY - stemHeight)
  ctx.stroke()

  // 🍃 Draw leaves
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(screenX - leafSize, screenY - stemHeight + 4, leafSize, leafSize / 2, -0.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(screenX + leafSize, screenY - stemHeight + 4, leafSize, leafSize / 2, 0.5, 0, Math.PI * 2)
  ctx.fill()
}

export const drawPlayer = (ctx: CanvasRenderingContext2D, player: any, now: number, viewportOffset: ViewportOffset, me: boolean) => {
  const { position, size, type, stats, name } = player
  const { x, y } = position
  const screenX = x - viewportOffset.x
  const screenY = y - viewportOffset.y

  drawInsect(ctx, screenX, screenY, size, type, me)

  // Health bar
  const healthBarWidth = 40 // largura fixa da barra de vida
  const healthBarHeight = 4
  const healthPercent = Math.max(0, Math.min(1, stats.health / stats.maxHealth)) // clamp entre 0 e 1

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

  if (name) {
    ctx.font = "12px Arial"; // Tamanho e fonte do texto
    ctx.fillStyle = "#FFFFFF"; // Cor do texto (branco)
    ctx.textAlign = "center"; // Alinha o texto no centro
    ctx.textBaseline = "bottom"; // Alinha o texto acima da barra de vida
    ctx.fillText(me ? 'EU' : name, screenX, barY - 3); // Posição do texto (um pouco acima da barra)
  }
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
  let fillColor: string = ''
  let strokeColor: string = ''

  const insectsArray = Object.fromEntries(insects.map(i => [i.id, i]));

  // Atribui cores baseado no tipo
  if (insectsArray[type]) {
    fillColor = insectsArray[type].colors.fill;
    strokeColor = insectsArray[type].colors.stroke;
  }

  // Add glow effect for player
  if (isPlayer) {
    ctx.shadowColor = fillColor
    ctx.shadowBlur = 10
    strokeColor = "#FFFFFF"
  }

  const insectDrawFunctions = insectDrawingComponents;
  
  if (insectDrawFunctions[type]) {
    insectDrawFunctions[type](ctx, fillColor, strokeColor);
  }  

  // Restore the context
  ctx.restore()
}

export const drawCactus = (
  ctx: CanvasRenderingContext2D,
  cactus: any,
  viewportOffset: ViewportOffset
) => {
  if (!cactus || typeof cactus.x !== 'number' || typeof cactus.y !== 'number') return

  const { x, y, width, height, color } = cactus
  const screenX = x - viewportOffset.x
  const screenY = y - viewportOffset.y

  ctx.fillStyle = color

  // Corpo principal (tronco)
  ctx.fillRect(screenX - width / 2, screenY - height, width, height)

  // Braços (estilo cartoon simples)
  ctx.fillRect(screenX - width * 0.8, screenY - height * 0.7, width * 0.3, height * 0.4)
  ctx.fillRect(screenX + width * 0.5, screenY - height * 0.5, width * 0.3, height * 0.4)
}
