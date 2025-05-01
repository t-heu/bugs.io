export function Beetle(ctx: any, fillColor: string, strokeColor: string) {
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
