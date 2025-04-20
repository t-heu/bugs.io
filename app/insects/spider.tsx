import React, { useRef, useEffect } from 'react';

export function Spider(ctx: any, fillColor: string, strokeColor: string) {
  // Spider SVG
  ctx.fillStyle = fillColor
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2

  // Body (2 segments)
  ctx.beginPath()
  ctx.ellipse(0, 0, 12, 12, 0, 0, Math.PI * 2) // Abdomen
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(0, 20, 8, 8, 0, 0, Math.PI * 2) // Head
  ctx.fill()
  ctx.stroke()

  // Eyes
  ctx.fillStyle = "#FFFFFF"
  ctx.beginPath()
  ctx.arc(-3, 18, 2, 0, Math.PI * 2)
  ctx.arc(3, 18, 2, 0, Math.PI * 2)
  ctx.fill()

  // Legs (8 legs, 4 on each side)
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2

  // Left legs
  ctx.beginPath()
  ctx.moveTo(-10, 0)
  ctx.quadraticCurveTo(-25, -15, -35, -5)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-12, 5)
  ctx.quadraticCurveTo(-30, 0, -40, 10)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-12, 10)
  ctx.quadraticCurveTo(-30, 20, -40, 25)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-10, 15)
  ctx.quadraticCurveTo(-25, 30, -35, 40)
  ctx.stroke()

  // Right legs
  ctx.beginPath()
  ctx.moveTo(10, 0)
  ctx.quadraticCurveTo(25, -15, 35, -5)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(12, 5)
  ctx.quadraticCurveTo(30, 0, 40, 10)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(12, 5)
  ctx.quadraticCurveTo(30, 0, 40, 10)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(12, 10)
  ctx.quadraticCurveTo(30, 20, 40, 25)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(10, 15)
  ctx.quadraticCurveTo(25, 30, 35, 40)
  ctx.stroke()
}

export const SpiderDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Spider(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
