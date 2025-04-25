import React, { useRef, useEffect } from 'react';

export function Termite(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  
  // Abdômen arredondado (segmentado)
  ctx.beginPath();
  ctx.ellipse(0, -20, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Tórax
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Cabeça ovalada
  ctx.beginPath();
  ctx.ellipse(0, 15, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Mandíbulas (curvas)
  ctx.beginPath();
  ctx.moveTo(-4, 22);
  ctx.quadraticCurveTo(-10, 25, -8, 18);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(4, 22);
  ctx.quadraticCurveTo(10, 25, 8, 18);
  ctx.stroke();
  
  // Antenas
  ctx.beginPath();
  ctx.moveTo(-3, 24);
  ctx.quadraticCurveTo(-10, 35, -8, 42);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(3, 24);
  ctx.quadraticCurveTo(10, 35, 8, 42);
  ctx.stroke();
  
  // Pernas simples (3 pares)
  for (let i = -1; i <= 1; i++) {
    let y = i * 6;
    ctx.beginPath();
    ctx.moveTo(-6, y);
    ctx.lineTo(-14, y - 4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(6, y);
    ctx.lineTo(14, y - 4);
    ctx.stroke();
  }
}

export const TermiteDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Termite(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
