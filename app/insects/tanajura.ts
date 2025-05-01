export function Tanajura(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  
  // Abdômen grande (bem característico)
  ctx.beginPath();
  ctx.ellipse(0, -20, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Tórax
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Cabeça
  ctx.beginPath();
  ctx.arc(0, 15, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Antenas
  ctx.beginPath();
  ctx.moveTo(-3, 20);
  ctx.quadraticCurveTo(-10, 28, -8, 35);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(3, 20);
  ctx.quadraticCurveTo(10, 28, 8, 35);
  ctx.stroke();
  
  // Pernas curtas
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-6, i * 5);
    ctx.lineTo(-16, i * 5 + 5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(6, i * 5);
    ctx.lineTo(16, i * 5 + 5);
    ctx.stroke();
  }
  
  // Asas (mais largas que as de uma formiga comum)
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.quadraticCurveTo(30, -10, 35, -35);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.quadraticCurveTo(-30, -10, -35, -35);
  ctx.stroke();
}
