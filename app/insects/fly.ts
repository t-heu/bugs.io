export function Fly(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo pequeno e arredondado
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 10, 0, 0, Math.PI * 2); // corpo
  ctx.fill();
  ctx.stroke();

  // Cabeça pequena
  ctx.beginPath();
  ctx.arc(0, -10, 4, 0, Math.PI * 2); // cabeça
  ctx.fill();
  ctx.stroke();

  // Olhos grandes
  ctx.beginPath();
  ctx.arc(-2, -12, 2, 0, Math.PI * 2); // olho esquerdo
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(2, -12, 2, 0, Math.PI * 2); // olho direito
  ctx.fill();
  ctx.stroke();

  // Antenas finas e curvadas
  ctx.beginPath();
  ctx.moveTo(-2, -14);
  ctx.lineTo(-5, -18);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2, -14);
  ctx.lineTo(5, -18);
  ctx.stroke();

  // Pernas finas
  ctx.beginPath();
  ctx.moveTo(-3, 2);
  ctx.lineTo(-7, 8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, 2);
  ctx.lineTo(7, 8);
  ctx.stroke();

  // Asas finas e translúcidas
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(10, -10);
  ctx.moveTo(0, -5);
  ctx.lineTo(-10, -10);
  ctx.stroke();
}
