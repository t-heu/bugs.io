import React, { useRef, useEffect } from 'react';

export function Mosquito(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo fino
  ctx.beginPath();
  ctx.ellipse(0, 10, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -5, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -18, 4, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Asas longas
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(-20, -25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(20, -25);
  ctx.stroke();

  // Pernas finas
  ctx.beginPath(); ctx.moveTo(-5, 5); ctx.lineTo(-20, 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(20, 10); ctx.stroke();

  ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(-20, -8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, -2); ctx.lineTo(20, -8); ctx.stroke();

  ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(-20, -18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, -10); ctx.lineTo(20, -18); ctx.stroke();

  // Probóscide
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(0, 26);
  ctx.stroke();
}

export const MosquitoDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Mosquito(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
