// 🍄 Utilitário interno para pegar os stats do personagem baseado no tipo
const getStatsByType = (characters: any, type: string) => {
  const character = characters.find((c: any) => c.id === type)
  return character?.stats || { speed: 1, attack: 1, health: 1 }
}

// 🍔 Função base para montar um bot com stats
const buildBot = (x: number, y: number, botStats: any, botType: string) => ({
  x,
  y,
  size: 30,
  speed: botStats.speed * 0.3,
  attack: botStats.attack,
  health: botStats.health * 10,
  maxHealth: botStats.health * 10,
  type: botType,
  direction: Math.random() * Math.PI * 2,
  directionChangeTime: 0,
  target: null,
  lastMoved: Date.now(),
  lastDamageTime: 0,
})

// 🐞 Cria um único bot
export const createBot = (
  x: number,
  y: number,
  characters: any,
  type: string | null = null
) => {
  const botTypes = ["ant", "spider", "beetle"]
  const botType = type || botTypes[Math.floor(Math.random() * botTypes.length)]
  const botStats = getStatsByType(characters, botType)

  return buildBot(x, y, botStats, botType)
}

export function generateFood(ARENA_SIZE: number) {
  return {
    x: Math.random() * ARENA_SIZE,
    y: Math.random() * ARENA_SIZE,
    size: 5 + Math.random() * 5,
    color: `hsl(${Math.random() * 60 + 80}, 70%, 50%)`,
  }
} 

// 🍏 Função utilitária para gerar comidas
export const generateInitialFood = (count: number, ARENA_SIZE: number) => {
  const items = []
  for (let i = 0; i < count; i++) {
    items.push({
      x: Math.random() * ARENA_SIZE,
      y: Math.random() * ARENA_SIZE,
      size: 5 + Math.random() * 5,
      color: `hsl(${Math.random() * 60 + 80}, 70%, 50%)`,
    })
  }
  return items
}

//  Função utilitária para gerar comidas
export const generateInitialBots = (
  count: number,
  ARENA_SIZE: number,
  characters: any,
  type: string | null = null
) => {
  const bots = []
  for (let i = 0; i < count; i++) {
    const x = Math.random() * ARENA_SIZE
    const y = Math.random() * ARENA_SIZE
    bots.push(createBot(x, y, characters, type))
  }
  return bots
}
