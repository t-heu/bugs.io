import React, { useRef, useEffect } from 'react';

export function Dragonfly(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo (segmentos mais finos)
  ctx.beginPath();
  ctx.ellipse(0, 10, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -2, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -12, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Asas
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-30, -20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(30, -20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(-30, -25);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(30, -25);
  ctx.stroke();

  // Antenas
  ctx.beginPath();
  ctx.moveTo(-3, 15);
  ctx.quadraticCurveTo(-10, 25, -8, 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, 15);
  ctx.quadraticCurveTo(10, 25, 8, 30);
  ctx.stroke();
}

export const DragonflyDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Dragonfly(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
