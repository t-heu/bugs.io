export function Caterpillar(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  
  // Corpo segmentado curvado com pelos
  for (let i = 0; i < 7; i++) {
    const x = i * 10 - 30;
    const y = Math.sin(i * 0.6) * 5;
    
    // Segmento do corpo
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Espinhos mais elaborados (trios em cima)
    for (let j = -1; j <= 1; j++) {
      const angle = -Math.PI / 2 + j * 0.3;
      const dx = Math.cos(angle) * 12;
      const dy = Math.sin(angle) * 12;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();
    }
    
    // Pelos laterais (esquerda e direita)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y + 5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10, y + 5);
    ctx.stroke();
  }
  
  // Cabeça
  ctx.beginPath();
  ctx.ellipse(-40, 0, 9, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Antenas curtas
  ctx.beginPath();
  ctx.moveTo(-43, -2);
  ctx.lineTo(-50, -10);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(-37, -2);
  ctx.lineTo(-30, -10);
  ctx.stroke();
}
