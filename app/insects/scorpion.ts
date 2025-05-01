export function Scorpion(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo principal (maior e achatado)
  ctx.beginPath();
  ctx.ellipse(0, 10, 10, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -5, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cauda curva
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.quadraticCurveTo(0, -40, 10, -40);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(10, -40, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pinças (chelas)
  ctx.beginPath();
  ctx.moveTo(-10, 15);
  ctx.quadraticCurveTo(-25, 20, -30, 25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 15);
  ctx.quadraticCurveTo(25, 20, 30, 25);
  ctx.stroke();

  // Pernas
  ctx.beginPath(); ctx.moveTo(-8, 10); ctx.lineTo(-20, 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-20, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-20, -15); ctx.stroke();

  ctx.beginPath(); ctx.moveTo(8, 10); ctx.lineTo(20, 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(20, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -10); ctx.lineTo(20, -15); ctx.stroke();
}
