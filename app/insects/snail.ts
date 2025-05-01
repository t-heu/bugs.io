export function Snail(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo base (formato baixo e largo)
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.quadraticCurveTo(-10, 10, 20, 10);
  ctx.quadraticCurveTo(35, 10, 40, 0);
  ctx.quadraticCurveTo(20, -5, -30, 0);
  ctx.fill();
  ctx.stroke();

  // Cabeça redonda
  ctx.beginPath();
  ctx.arc(35, -5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tentáculos (olhos)
  ctx.beginPath();
  ctx.moveTo(33, -8);
  ctx.lineTo(30, -18);
  ctx.arc(30, -19.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(37, -8);
  ctx.lineTo(40, -18);
  ctx.arc(40, -19.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Concha em espiral
  ctx.beginPath();
  ctx.arc(-15, -5, 14, 0, Math.PI * 2); // externo
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-15, -5, 9, 0, Math.PI * 2); // meio
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-15, -5, 4, 0, Math.PI * 2); // interno
  ctx.stroke();
}
