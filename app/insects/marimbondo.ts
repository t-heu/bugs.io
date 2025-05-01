export function Marimbondo(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  
  // Abdômen com cintura fina
  ctx.beginPath();
  ctx.ellipse(0, -20, 6, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Cintura fina conectando ao tórax
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(0, -2);
  ctx.stroke();
  
  // Tórax
  ctx.beginPath();
  ctx.ellipse(0, 6, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Cabeça
  ctx.beginPath();
  ctx.arc(0, 22, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Antenas
  ctx.beginPath();
  ctx.moveTo(-3, 27);
  ctx.quadraticCurveTo(-12, 35, -10, 45);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(3, 27);
  ctx.quadraticCurveTo(12, 35, 10, 45);
  ctx.stroke();
  
  // Asas superiores
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(25, -10, 30, -30);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-25, -10, -30, -30);
  ctx.stroke();
  
  // Pernas longas
  for (let i = 0; i < 3; i++) {
    const y = 0 + i * 5;
    ctx.beginPath();
    ctx.moveTo(-6, y);
    ctx.lineTo(-15, y + 10);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(6, y);
    ctx.lineTo(15, y + 10);
    ctx.stroke();
  }
  
  // Ferrão pontudo
  ctx.beginPath();
  ctx.moveTo(0, -35);
  ctx.lineTo(0, -40);
  ctx.stroke();
}
