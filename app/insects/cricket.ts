export function Cricket(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo com leve curvatura
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.bezierCurveTo(10, -10, 10, 10, 0, 20);
  ctx.bezierCurveTo(-10, 10, -10, -10, 0, -20);
  ctx.fill();
  ctx.stroke();

  // Cabeça mais próxima e levemente oval
  ctx.beginPath();
  ctx.ellipse(0, 28, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Olhos pequenos
  ctx.beginPath();
  ctx.arc(-3, 27, 1.5, 0, Math.PI * 2);
  ctx.arc(3, 27, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = strokeColor;
  ctx.fill();

  // Pernas traseiras com articulação
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.lineTo(-18, -25);
  ctx.lineTo(-28, -10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(6, -10);
  ctx.lineTo(18, -25);
  ctx.lineTo(28, -10);
  ctx.stroke();

  // Pernas médias (frente do corpo)
  ctx.beginPath();
  ctx.moveTo(-5, 5);
  ctx.lineTo(-15, 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(15, 15);
  ctx.stroke();

  // Antenas fluídas
  ctx.beginPath();
  ctx.moveTo(-3, 33);
  ctx.quadraticCurveTo(-18, 45, -10, 60);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, 33);
  ctx.quadraticCurveTo(18, 45, 10, 60);
  ctx.stroke();
}
