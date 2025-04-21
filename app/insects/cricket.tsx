import React, { useRef, useEffect } from 'react';

export function Cricket(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo com leve curvatura
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.bezierCurveTo(10, -10, 10, 10, 0, 20);
  ctx.bezierCurveTo(-10, 10, -10, -10, 0, -20);
  ctx.fill();
  ctx.stroke();

  // Cabeça mais próxima e levemente oval
  ctx.beginPath();
  ctx.ellipse(0, 28, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Olhos pequenos
  ctx.beginPath();
  ctx.arc(-3, 27, 1.5, 0, Math.PI * 2);
  ctx.arc(3, 27, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = strokeColor;
  ctx.fill();

  // Pernas traseiras com articulação
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.lineTo(-18, -25);
  ctx.lineTo(-28, -10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(6, -10);
  ctx.lineTo(18, -25);
  ctx.lineTo(28, -10);
  ctx.stroke();

  // Pernas médias (frente do corpo)
  ctx.beginPath();
  ctx.moveTo(-5, 5);
  ctx.lineTo(-15, 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(15, 15);
  ctx.stroke();

  // Antenas fluídas
  ctx.beginPath();
  ctx.moveTo(-3, 33);
  ctx.quadraticCurveTo(-18, 45, -10, 60);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, 33);
  ctx.quadraticCurveTo(18, 45, 10, 60);
  ctx.stroke();
}

export const CricketDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Cricket(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
