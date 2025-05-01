export function Bee(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo segmentado listrado
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -10 + i * 10, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Ferrão
  ctx.beginPath();
  ctx.moveTo(0, 42);   // Base do ferrão (abaixo do último segmento)
  ctx.lineTo(0, 20);   // Ponta do ferrão
  ctx.stroke();

  // Cabeça
  ctx.beginPath();
  ctx.ellipse(0, 25, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Asas superiores
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(20, -20);
  ctx.moveTo(0, 0);
  ctx.lineTo(-20, -20);
  ctx.stroke();
}