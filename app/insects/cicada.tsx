import React, { useRef, useEffect } from 'react';

export function Cicada(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
ctx.strokeStyle = strokeColor;
ctx.lineWidth = 2;

// Corpo segmentado
ctx.beginPath();
ctx.moveTo(-6, -20);
ctx.lineTo(6, -20);
ctx.lineTo(8, 0);
ctx.lineTo(6, 20);
ctx.lineTo(-6, 20);
ctx.lineTo(-8, 0);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Cabeça arredondada
ctx.beginPath();
ctx.ellipse(0, 25, 7, 6, 0, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

// Olhos grandes nas laterais
ctx.beginPath();
ctx.arc(-5, 25, 2, 0, Math.PI * 2);
ctx.arc(5, 25, 2, 0, Math.PI * 2);
ctx.fillStyle = strokeColor;
ctx.fill();

// Asas transparentes com leve preenchimento
ctx.globalAlpha = 0.2;
ctx.fillStyle = strokeColor;

ctx.beginPath();
ctx.moveTo(-6, -15);
ctx.quadraticCurveTo(-40, 0, -25, 25);
ctx.lineTo(-5, 5);
ctx.closePath();
ctx.fill();
ctx.stroke();

ctx.beginPath();
ctx.moveTo(6, -15);
ctx.quadraticCurveTo(40, 0, 25, 25);
ctx.lineTo(5, 5);
ctx.closePath();
ctx.fill();
ctx.stroke();

ctx.globalAlpha = 1.0; // Reset transparência

// Pernas simples (pra dar base)
ctx.beginPath();
ctx.moveTo(-4, 10);
ctx.lineTo(-12, 20);
ctx.moveTo(4, 10);
ctx.lineTo(12, 20);
ctx.stroke();

}

export const CicadaDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Cicada(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
