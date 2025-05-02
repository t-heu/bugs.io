export function VelvetAnt(ctx: CanvasRenderingContext2D, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo segmentado com listras (3 segmentos)
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -10 + i * 10, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Listras pretas horizontais
    ctx.beginPath();
    ctx.strokeStyle = '#000'; // Listras pretas
    ctx.moveTo(-10, -10 + i * 10);
    ctx.lineTo(10, -10 + i * 10);
    ctx.stroke();
    ctx.strokeStyle = strokeColor; // Restaura stroke original
  }

  // Cabeça
  ctx.beginPath();
  ctx.ellipse(0, 25, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mandíbulas simples
  ctx.beginPath();
  ctx.moveTo(-5, 35);
  ctx.lineTo(-10, 40);
  ctx.moveTo(5, 35);
  ctx.lineTo(10, 40);
  ctx.stroke();

   // Patas (4 pares)
   const legPositions = [
    { x: -10, y: 10 }, // Frente esquerda
    { x: 10, y: 10 },  // Frente direita
    { x: -10, y: 20 }, // Trás esquerda
    { x: 10, y: 20 },  // Trás direita
  ];

  legPositions.forEach((pos) => {
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x - 5, pos.y + 10); // Frente ou traseira das patas
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + 5, pos.y + 10);
    ctx.stroke();
  });
}
