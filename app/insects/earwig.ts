export function Earwig(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  
  // Corpo segmentado achatado
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -10 + i * 8, 6 + i * 0.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  
  // Cabeça
  ctx.beginPath();
  ctx.ellipse(0, 30, 6, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Antenas longas e finas
  ctx.beginPath();
  ctx.moveTo(-2, 34);
  ctx.quadraticCurveTo(-12, 45, -18, 55);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(2, 34);
  ctx.quadraticCurveTo(12, 45, 18, 55);
  ctx.stroke();
  
  // Pinça traseira (tesoura) curvada
  ctx.beginPath();
  ctx.moveTo(-3, -14);
  ctx.quadraticCurveTo(-8, -28, -4, -35);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(3, -14);
  ctx.quadraticCurveTo(8, -28, 4, -35);
  ctx.stroke();
  
  // Pernas simples
  for (let i = 0; i < 3; i++) {
    const y = -5 + i * 8;
    ctx.beginPath();
    ctx.moveTo(-6, y);
    ctx.lineTo(-14, y + 4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(6, y);
    ctx.lineTo(14, y + 4);
    ctx.stroke();
  }
}
