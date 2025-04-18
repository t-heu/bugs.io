// Tipos possíveis para o tipo de inseto
type InsectType = "ant" | "spider" | "beetle";

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
