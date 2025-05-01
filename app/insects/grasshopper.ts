export function Grasshopper(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo segmentado, levemente inclinado
  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.lineTo(6, -18);
  ctx.lineTo(10, 0);
  ctx.lineTo(6, 18);
  ctx.lineTo(-6, 18);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cabeça arredondada e mais próxima do corpo
  ctx.beginPath();
  ctx.ellipse(0, 22, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Olhos simples
  ctx.beginPath();
  ctx.arc(-3, 22, 1.5, 0, Math.PI * 2);
  ctx.arc(3, 22, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = strokeColor;
  ctx.fill();

  // Antenas longas e arqueadas
  ctx.beginPath();
  ctx.moveTo(-3, 27);
  ctx.quadraticCurveTo(-20, 35, -15, 50);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, 27);
  ctx.quadraticCurveTo(20, 35, 15, 50);
  ctx.stroke();

  // Pernas traseiras com articulação em "Z"
  ctx.beginPath();
  ctx.moveTo(-4, -10);
  ctx.lineTo(-12, -25);
  ctx.lineTo(-24, -15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4, -10);
  ctx.lineTo(12, -25);
  ctx.lineTo(24, -15);
  ctx.stroke();

  // Pernas médias simples (frente do corpo)
  ctx.beginPath();
  ctx.moveTo(-5, 5);
  ctx.lineTo(-15, 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(15, 15);
  ctx.stroke();
}
