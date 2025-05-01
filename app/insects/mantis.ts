export function Mantis(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo segmentado (tronco alongado e fino com ponta)
  ctx.beginPath();
  ctx.moveTo(0, 25); // parte inferior do corpo
  ctx.lineTo(6, 15);
  ctx.lineTo(3, 0);
  ctx.lineTo(6, -15);
  ctx.lineTo(0, -25); // ponta do abdômen
  ctx.lineTo(-6, -15);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-6, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cabeça angular (mais próxima do corpo, na altura ~28)
  ctx.beginPath();
  ctx.moveTo(-6, 26);
  ctx.lineTo(0, 32);
  ctx.lineTo(6, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Antenas ajustadas de acordo com nova cabeça
  ctx.beginPath();
  ctx.moveTo(-3, 32);
  ctx.quadraticCurveTo(-10, 42, -16, 36);
  ctx.moveTo(3, 32);
  ctx.quadraticCurveTo(10, 42, 16, 36);
  ctx.stroke();

  // Pernas em prece com garras curvas
  ctx.beginPath();
  ctx.moveTo(-5, 15);
  ctx.quadraticCurveTo(-18, 10, -12, -5);  // parte superior
  ctx.quadraticCurveTo(-16, -10, -10, -15); // garra
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(5, 15);
  ctx.quadraticCurveTo(18, 10, 12, -5);
  ctx.quadraticCurveTo(16, -10, 10, -15);
  ctx.stroke();

  // Pernas traseiras com dobra
  ctx.beginPath();
  ctx.moveTo(-4, -20);
  ctx.lineTo(-15, -35);
  ctx.lineTo(-25, -25);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4, -20);
  ctx.lineTo(15, -35);
  ctx.lineTo(25, -25);
  ctx.stroke();
}
