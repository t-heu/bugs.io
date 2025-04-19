  // Função para criar um bot
export const createBot = (x: number, y: number, characters, type = null) => {
    const botTypes = ["ant", "spider", "beetle"]
    const botType = type || botTypes[Math.floor(Math.random() * botTypes.length)]
    let botStats = {}

    if (botType === "ant") {
      botStats = characters[0].stats
    } else if (botType === "spider") {
      botStats = characters[1].stats
    } else if (botType === "beetle") {
      botStats = characters[2].stats
    }

    return {
      x: x,
      y: y,
      size: 30,
      speed: botStats.speed * 0.3,
      attack: botStats.attack,
      health: botStats.health * 10,
      maxHealth: botStats.health * 10,
      type: botType,
      direction: Math.random() * Math.PI * 2,
      directionChangeTime: 0,
      target: null,
      lastMoved: Date.now(), // Timestamp para depuração
      lastDamageTime: 0, // Para efeito visual de dano
    }
  }

// 🍏 Função utilitária para gerar comidas
export const generateInitialFood = (count: number, ARENA_SIZE) => {
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
export const generateInitialBots = (count: number, ARENA_SIZE, characters, type = null,) => {
  const botTypes = ["ant", "spider", "beetle"]
  const botType = type || botTypes[Math.floor(Math.random() * botTypes.length)]
  let botStats = {}

  if (botType === "ant") {
    botStats = characters[0].stats
  } else if (botType === "spider") {
    botStats = characters[1].stats
  } else if (botType === "beetle") {
    botStats = characters[2].stats
  }

  const items = []
  for (let i = 0; i < count; i++) {
    items.push({
      x: Math.random() * ARENA_SIZE,
      y: Math.random() * ARENA_SIZE,
      size: 30,
      speed: botStats.speed * 0.3,
      attack: botStats.attack,
      health: botStats.health * 10,
      maxHealth: botStats.health * 10,
      type: botType,
      direction: Math.random() * Math.PI * 2,
      directionChangeTime: 0,
      target: null,
      lastMoved: Date.now(), // Timestamp para depuração
      lastDamageTime: 0, // Para efeito visual de dano
    })
  }
  return items
}
