export function Worm(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo (vários segmentos)
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -20 + i * 12, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Cabeça
  ctx.beginPath();
  ctx.ellipse(0, 32, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
