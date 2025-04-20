import React, { useRef, useEffect } from 'react';

export function Ladybug(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2
  
  // Body
  ctx.beginPath()
  ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  
  // Head
  ctx.beginPath()
  ctx.ellipse(0, 18, 6, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  
  // Spots
  ctx.fillStyle = "#000"
  ctx.beginPath()
  ctx.arc(-6, -4, 2, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(6, 2, 2, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(-4, 6, 2, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(4, -6, 2, 0, Math.PI * 2)
  ctx.fill()
  
  // Antennae
  ctx.strokeStyle = strokeColor
  ctx.beginPath()
  ctx.moveTo(-3, 23)
  ctx.quadraticCurveTo(-10, 30, -8, 35)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(3, 23)
  ctx.quadraticCurveTo(10, 30, 8, 35)
  ctx.stroke()
  
  // Legs (6)
  ctx.beginPath()
  ctx.moveTo(-10, -5)
  ctx.lineTo(-25, -10)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(-12, 0)
  ctx.lineTo(-25, 5)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(-10, 5)
  ctx.lineTo(-25, 15)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(10, -5)
  ctx.lineTo(25, -10)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(12, 0)
  ctx.lineTo(25, 5)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(10, 5)
  ctx.lineTo(25, 15)
  ctx.stroke()
}

export const LadybugDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Ladybug(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
