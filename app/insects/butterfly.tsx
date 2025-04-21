import React, { useRef, useEffect } from 'react';

export function Butterfly(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo
  ctx.beginPath();
  ctx.ellipse(0, 5, 4, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -10, 3, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Antenas
  ctx.beginPath(); ctx.moveTo(-3, 10); ctx.lineTo(-10, 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, 10); ctx.lineTo(10, 18); ctx.stroke();

  // Asas (duas de cada lado)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -20, -30, 20, 0, 0); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(30, -20, 30, 20, 0, 0); ctx.fill(); ctx.stroke();
}

export const ButterflyDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Butterfly(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
