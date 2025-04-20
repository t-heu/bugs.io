// Tipos possíveis para o tipo de inseto
type InsectType = "ant" | "spider" | "beetle" | "cockroach" | "ladybug" | "wasp";
type ViewportOffset = {
  x: number;
  y: number;
};

import {Ant} from "@/app/insects/ant";
import {Beetle} from "@/app/insects/beetle"
import {Cockroach} from "@/app/insects/cockroach"
import {Ladybug} from "@/app/insects/ladybug"
import {Spider} from "@/app/insects/spider"
import {Wasp} from "@/app/insects/wasp"

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

export const drawPlayer = (ctx: CanvasRenderingContext2D, player: any, now: number, viewportOffset: ViewportOffset, me: boolean) => {
  const { x, y, size, type, health, maxHealth, name } = player
  const screenX = x - viewportOffset.x
  const screenY = y - viewportOffset.y

  drawInsect(ctx, screenX, screenY, size, type, me)

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

  if (type === "ant") {
    fillColor = "#FF5722"
    strokeColor = "#D84315"
  } else if (type === "spider") {
    fillColor = "#9C27B0"
    strokeColor = "#6A1B9A"
  } else if (type === "beetle") {
    fillColor = "#3F51B5"
    strokeColor = "#283593"
  } else if (type === "wasp") {
    fillColor = "#FFC107"
    strokeColor = "#FFA000"
  } else if (type === "cockroach") {
    fillColor = "#795548"
    strokeColor = "#4E342E"
  } else if (type === "ladybug") {
    fillColor = "#F44336"
    strokeColor = "#B71C1C"
  }

  // Add glow effect for player
  if (isPlayer) {
    ctx.shadowColor = fillColor
    ctx.shadowBlur = 10
    strokeColor = "#FFFFFF"
  }

  // Draw the insect based on type
  if (type === "ant") {
    Ant(ctx, fillColor, strokeColor)
  } else if (type === "spider") {
    Spider(ctx, fillColor, strokeColor)
  } else if (type === "beetle") {
    Beetle(ctx, fillColor, strokeColor)
  } else if (type === "wasp") {
    Wasp(ctx, fillColor, strokeColor)
  } else if (type === "cockroach") {
    Cockroach(ctx, fillColor, strokeColor)
  } else if (type === "ladybug") {
    Ladybug(ctx, fillColor, strokeColor)
  }  

  // Restore the context
  ctx.restore()
}
