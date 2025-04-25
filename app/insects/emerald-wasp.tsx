import React, { useRef, useEffect } from 'react';

export function EmeraldWasp(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  
  // Abdômen esguio e longo
  ctx.beginPath();
  ctx.ellipse(0, -25, 6, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Cintura estreita
  ctx.beginPath();
  ctx.ellipse(0, -7, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Tórax
  ctx.beginPath();
  ctx.ellipse(0, 8, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Cabeça marcante
  ctx.beginPath();
  ctx.arc(0, 22, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Antenas longas e finas
  ctx.beginPath();
  ctx.moveTo(-3, 26);
  ctx.quadraticCurveTo(-10, 35, -8, 45);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(3, 26);
  ctx.quadraticCurveTo(10, 35, 8, 45);
  ctx.stroke();
  
  // Pernas delicadas
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-6, i * 5);
    ctx.lineTo(-15, i * 5 + 4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(6, i * 5);
    ctx.lineTo(15, i * 5 + 4);
    ctx.stroke();
  }
  
  // Asas transparentes e elegantes
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.quadraticCurveTo(25, -10, 20, -35);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.quadraticCurveTo(-25, -10, -20, -35);
  ctx.stroke();
}

export const EmeraldWaspDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    EmeraldWasp(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
