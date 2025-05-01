export function Butterfly(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo
  ctx.beginPath();
  ctx.ellipse(0, 5, 4, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -10, 3, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Antenas
  ctx.beginPath(); ctx.moveTo(-3, 10); ctx.lineTo(-10, 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, 10); ctx.lineTo(10, 18); ctx.stroke();

  // Asas (duas de cada lado)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -20, -30, 20, 0, 0); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(30, -20, 30, 20, 0, 0); ctx.fill(); ctx.stroke();
}
