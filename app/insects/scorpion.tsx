import React, { useRef, useEffect } from 'react';

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

export const ScorpionDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Scorpion(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
