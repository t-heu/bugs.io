import React, { useRef, useEffect } from 'react';

export function Ant(ctx: any, fillColor: string, strokeColor: string) {
  // Configura as propriedades do contexto
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo (3 segmentos)
  // Cabeça
  ctx.beginPath();
  ctx.ellipse(0, 10, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Meio
  ctx.beginPath();
  ctx.ellipse(0, -5, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Traseira
  ctx.beginPath();
  ctx.ellipse(0, -20, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Antenas
  ctx.beginPath();
  ctx.moveTo(-4, 15);
  ctx.quadraticCurveTo(-15, 30, -10, 35);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4, 15);
  ctx.quadraticCurveTo(15, 30, 10, 35);
  ctx.stroke();

  // Pernas (6 pernas, 3 de cada lado)
  // Pernas esquerdas
  ctx.beginPath();
  ctx.moveTo(-8, 10);
  ctx.lineTo(-25, 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(-25, -5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-10, -15);
  ctx.lineTo(-25, -25);
  ctx.stroke();

  // Pernas direitas
  ctx.beginPath();
  ctx.moveTo(8, 10);
  ctx.lineTo(25, 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(25, -5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(10, -15);
  ctx.lineTo(25, -25);
  ctx.stroke();
}

export const AntDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Ant(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
