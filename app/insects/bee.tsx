import React, { useRef, useEffect } from 'react';

export function Bee(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo segmentado listrado
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -10 + i * 10, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Ferrão
  ctx.beginPath();
  ctx.moveTo(0, 42);   // Base do ferrão (abaixo do último segmento)
  ctx.lineTo(0, 20);   // Ponta do ferrão
  ctx.stroke();

  // Cabeça
  ctx.beginPath();
  ctx.ellipse(0, 25, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Asas superiores
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(20, -20);
  ctx.moveTo(0, 0);
  ctx.lineTo(-20, -20);
  ctx.stroke();
}

export const BeeDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Bee(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
