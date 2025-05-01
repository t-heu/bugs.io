export function Cockroach(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2
  
  // Body
  ctx.beginPath()
  ctx.ellipse(0, 0, 12, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  
  // Head
  ctx.beginPath()
  ctx.ellipse(0, 22, 8, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  
  // Antennae
  ctx.beginPath()
  ctx.moveTo(-4, 28)
  ctx.quadraticCurveTo(-15, 35, -20, 40)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(4, 28)
  ctx.quadraticCurveTo(15, 35, 20, 40)
  ctx.stroke()
  
  // Legs (6)
  ctx.beginPath()
  ctx.moveTo(-12, -5)
  ctx.lineTo(-28, -8)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(-14, 0)
  ctx.lineTo(-30, 5)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(-12, 5)
  ctx.lineTo(-28, 15)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(12, -5)
  ctx.lineTo(28, -8)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(14, 0)
  ctx.lineTo(30, 5)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(12, 5)
  ctx.lineTo(28, 15)
  ctx.stroke()
}
