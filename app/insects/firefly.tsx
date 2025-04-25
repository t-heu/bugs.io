import React, { useRef, useEffect } from 'react';

export function Firefly(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  
  // Corpo (três segmentos)
  ctx.beginPath(); // Tórax
  ctx.ellipse(0, 0, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath(); // Meio do abdômen
  ctx.ellipse(0, -12, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Abdômen luminoso (ponta)
  ctx.fillStyle = "#ffff66"; // tom amarelado para luz
  ctx.beginPath();
  ctx.ellipse(0, -24, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Cabeça
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(0, 14, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Antenas
  ctx.beginPath();
  ctx.moveTo(-3, 18);
  ctx.quadraticCurveTo(-10, 25, -8, 30);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(3, 18);
  ctx.quadraticCurveTo(10, 25, 8, 30);
  ctx.stroke();
  
  // Pernas (3 pares)
  for (let i = -1; i <= 1; i++) {
    let y = i * 6;
    ctx.beginPath();
    ctx.moveTo(-7, y);
    ctx.lineTo(-14, y - 4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(7, y);
    ctx.lineTo(14, y - 4);
    ctx.stroke();
  }
  
  // Asas fechadas
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(-12, -16);
  ctx.moveTo(6, -6);
  ctx.lineTo(12, -16);
  ctx.stroke();
}

export const FireflyDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    Firefly(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
