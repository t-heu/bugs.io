export function Moth(ctx: any, fillColor: string, strokeColor: string) {
  // Estilo
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo segmentado (de cima pra baixo)
  ctx.beginPath();
  ctx.ellipse(0, -18, 6, 8, 0, 0, Math.PI * 2); // Cabeça
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -6, 5, 10, 0, 0, Math.PI * 2); // Tórax
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 10, 4, 10, 0, 0, Math.PI * 2); // Abdômen
  ctx.fill();
  ctx.stroke();

  // Antenas mais curvas e ornamentadas
  ctx.beginPath();
  ctx.moveTo(-3, -25);
  ctx.quadraticCurveTo(-10, -40, -6, -55);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, -25);
  ctx.quadraticCurveTo(10, -40, 6, -55);
  ctx.stroke();

  // Asas superiores com preenchimento leve
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = strokeColor;

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.bezierCurveTo(-40, -30, -50, -70, -10, -90);
  ctx.lineTo(-5, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.bezierCurveTo(40, -30, 50, -70, 10, -90);
  ctx.lineTo(5, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Asas inferiores
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-35, 5, -30, 30, -5, 35);
  ctx.lineTo(-3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(35, 5, 30, 30, 5, 35);
  ctx.lineTo(3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 1.0; // Reset da transparência
}
