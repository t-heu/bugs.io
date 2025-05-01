export function Dragonfly(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo (segmentos mais finos)
  ctx.beginPath();
  ctx.ellipse(0, 10, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -2, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -12, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Asas
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-30, -20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(30, -20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(-30, -25);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(30, -25);
  ctx.stroke();

  // Antenas
  ctx.beginPath();
  ctx.moveTo(-3, 15);
  ctx.quadraticCurveTo(-10, 25, -8, 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, 15);
  ctx.quadraticCurveTo(10, 25, 8, 30);
  ctx.stroke();
}
