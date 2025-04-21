import React, { useRef, useEffect } from 'react';

export function StickBug(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo reto
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.lineTo(0, 30);
  ctx.stroke();

  // Cabeça
  ctx.beginPath();
  ctx.arc(0, 35, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pernas longas e finas
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-25, -30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(25, -30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-25, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(25, 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(-25, 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 25);
  ctx.lineTo(25, 35);
  ctx.stroke();
}

export const StickBugDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    StickBug(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
