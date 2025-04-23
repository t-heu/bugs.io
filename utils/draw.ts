// Tipos possíveis para o tipo de inseto
export type InsectType = 
  | "ant" 
  | "spider" 
  | "beetle" 
  | "cockroach" 
  | "ladybug" 
  | "wasp"
  | "scorpion"
  | "butterfly"
  | "mosquito"
  | "mantis"
  | "stick_bug"
  | "centipede"
  | "cricket"
  | "dragonfly"
  | "cicada"
  | "bee"
  | "water_bug"
  | "worm"
  | "grasshopper"
  | "moth"
  | "snail"
  | "fly";

type ViewportOffset = {
  x: number;
  y: number;
};

import insects from "../insects.json"
import { ARENA_SIZE } from "@/utils/gameConstants"

import {Ant} from "@/app/insects/ant";
import {Beetle} from "@/app/insects/beetle"
import {Cockroach} from "@/app/insects/cockroach"
import {Ladybug} from "@/app/insects/ladybug"
import {Spider} from "@/app/insects/spider"
import {Wasp} from "@/app/insects/wasp"
import {Scorpion} from "@/app/insects/scorpion"
import {Butterfly} from "@/app/insects/butterfly"
import {Mosquito} from "@/app/insects/mosquito"
import {Mantis} from "@/app/insects/mantis"
import {StickBug} from "@/app/insects/stickBug"
import {Centipede} from "@/app/insects/centipede"
import {Cricket} from "@/app/insects/cricket"
import {Dragonfly} from "@/app/insects/dragonfly"
import {Cicada} from "@/app/insects/cicada"
import {Bee} from "@/app/insects/bee"
import {WaterBug} from "@/app/insects/waterBug"
import {Worm} from "@/app/insects/worm"
import {Grasshopper} from "@/app/insects/grasshopper"
import {Moth} from "@/app/insects/moth"
import {Fly} from "@/app/insects/fly"
import {Snail} from "@/app/insects/snail"

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

  const insectDrawFunctions = {
    ant: Ant,
    spider: Spider,
    beetle: Beetle,
    wasp: Wasp,
    cockroach: Cockroach,
    ladybug: Ladybug,
    scorpion: Scorpion,
    butterfly: Butterfly,
    mosquito: Mosquito,
    mantis: Mantis,
    "stick_bug": StickBug,
    centipede: Centipede,
    cricket: Cricket,
    dragonfly: Dragonfly,
    cicada: Cicada,
    bee: Bee,
    "water_bug": WaterBug,
    worm: Worm,
    grasshopper: Grasshopper,
    moth: Moth,
    fly: Fly,
    snail: Snail
  };
  
  if (insectDrawFunctions[type]) {
    insectDrawFunctions[type](ctx, fillColor, strokeColor);
  }  

  // Restore the context
  ctx.restore()
}

export const drawCactus = (
  ctx: CanvasRenderingContext2D,
  cactus: any,
  viewportOffset: { x: number; y: number }
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
