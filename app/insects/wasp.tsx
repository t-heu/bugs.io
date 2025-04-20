import React, { useRef, useEffect } from 'react';

export function Wasp(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2

  // Abdômen listrado
  ctx.beginPath()
  ctx.ellipse(0, 20, 10, 14, 0, 0, Math.PI * 2) // Abdômen
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-6, 20)
  ctx.lineTo(6, 20)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-5, 25)
  ctx.lineTo(5, 25)
  ctx.stroke()

  // Tórax
  ctx.beginPath()
  ctx.ellipse(0, 0, 9, 10, 0, 0, Math.PI * 2) // Tórax
  ctx.fill()
  ctx.stroke()

  // Cabeça
  ctx.beginPath()
  ctx.arc(0, -15, 6, 0, Math.PI * 2) // Cabeça
  ctx.fill()
  ctx.stroke()

  // Asas
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(-20, -10, -25, -25)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(20, -10, 25, -25)
  ctx.stroke()

  // Pernas
  ctx.beginPath()
  ctx.moveTo(-8, 5)
  ctx.lineTo(-20, 15)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(8, 5)
  ctx.lineTo(20, 15)
  ctx.stroke()

  // Ferrão
  ctx.beginPath()
  ctx.moveTo(0, 34)
  ctx.lineTo(0, 44)
  ctx.stroke()
}

export const WaspDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Wasp(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
