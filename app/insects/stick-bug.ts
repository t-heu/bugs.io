export function StickBug(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo reto
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.lineTo(0, 30);
  ctx.stroke();

  // Cabeça
  ctx.beginPath();
  ctx.arc(0, 35, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pernas longas e finas
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-25, -30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(25, -30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-25, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(25, 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(-25, 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 25);
  ctx.lineTo(25, 35);
  ctx.stroke();
}
