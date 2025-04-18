  // Função para criar um bot
export const createBot = (x: number, y: number, type = null) => {
    const botTypes = ["ant", "spider", "beetle"]
    const botType = type || botTypes[Math.floor(Math.random() * botTypes.length)]
    let botStats = { speed: 5, attack: 5, health: 5 }

    if (botType === "ant") {
      botStats = { speed: 8, attack: 5, health: 3 }
    } else if (botType === "spider") {
      botStats = { speed: 5, attack: 8, health: 5 }
    } else if (botType === "beetle") {
      botStats = { speed: 3, attack: 5, health: 8 }
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

  export const spawnBotsNearPlayer = (player, bots, setBots, BOT_COUNT, ARENA_SIZE) => {
      const newBots: any = [...bots]
      for (let i = 0; i < BOT_COUNT; i++) {
        // Posicionar próximo ao jogador
        const angle = Math.random() * Math.PI * 2
        const distance = 100 + Math.random() * 100
        const x = player.x + Math.cos(angle) * distance
        const y = player.y + Math.sin(angle) * distance
  
        newBots.push(createBot(Math.max(0, Math.min(ARENA_SIZE, x)), Math.max(0, Math.min(ARENA_SIZE, y))))
      }
      setBots(newBots)
    }