export function Centipede(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Antenas no fundo, suspensas e viradas para cima
  ctx.beginPath();
  ctx.moveTo(-4, -20);  // Ponto inicial da antena esquerda, mais alto
  ctx.quadraticCurveTo(-3, -30, -22, -50);  // Curva da antena esquerda, mais suspensa
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4, -20);  // Ponto inicial da antena direita, mais alto
  ctx.quadraticCurveTo(3, -30, 22, -50);  // Curva da antena direita, mais suspensa
  ctx.stroke();

  // Corpo (vários segmentos)
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -20 + i * 12, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Cabeça
  ctx.beginPath();
  ctx.ellipse(0, 45, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Antenas
  ctx.beginPath();
  ctx.moveTo(-4, 50);
  ctx.quadraticCurveTo(-15, 65, -10, 70);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4, 50);
  ctx.quadraticCurveTo(15, 65, 10, 70);
  ctx.stroke();

  // Perninhas
  for (let i = 0; i < 5; i++) {
    let y = -20 + i * 12;
    ctx.beginPath();
    ctx.moveTo(-8, y);
    ctx.lineTo(-20, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(20, y);
    ctx.stroke();
  }
}
