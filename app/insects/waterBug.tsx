import React, { useRef, useEffect } from 'react';

export function WaterBug(ctx: any, fillColor: string, strokeColor: string) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Corpo achatado e mais pontudo nas extremidades
  ctx.beginPath();
  ctx.moveTo(0, -22);                 // topo pontudo
  ctx.bezierCurveTo(14, -15, 14, 15, 0, 22);   // lado direito
  ctx.bezierCurveTo(-14, 15, -14, -15, 0, -22); // lado esquerdo
  ctx.fill();
  ctx.stroke();

  // Pernas nadadeiras (3 de cada lado)
  ctx.beginPath();
  ctx.moveTo(-12, 0); ctx.lineTo(-28, 2);     // perna do meio esquerda
  ctx.moveTo(-10, 10); ctx.lineTo(-24, 20);   // perna frontal esquerda

  ctx.moveTo(12, 0); ctx.lineTo(28, 2);       // perna do meio direita
  ctx.moveTo(10, 10); ctx.lineTo(24, 20);     // perna frontal direita
  ctx.stroke();

  // Antenas (curvadas para frente)
  ctx.beginPath();
  ctx.moveTo(-4, -22);
  ctx.quadraticCurveTo(-10, -30, -16, -24);

  ctx.moveTo(4, -22);
  ctx.quadraticCurveTo(10, -30, 16, -24);
  ctx.stroke();

  // Olhos (pequenos círculos)
  ctx.beginPath();
  ctx.arc(-5, -14, 2, 0, Math.PI * 2);
  ctx.arc(5, -14, 2, 0, Math.PI * 2);
  ctx.fillStyle = strokeColor;
  ctx.fill();

  // Ferrão (pequeno traço reto na parte inferior)
  ctx.beginPath();
  ctx.moveTo(0, 22);    // base do corpo (centro inferior)
  ctx.lineTo(0, 28);    // pontinha do ferrão
  ctx.stroke();
}

export const WaterBugDrawing = ({ fillColor, strokeColor }: {fillColor: string, strokeColor: string}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tudo antes de desenhar

    ctx.save(); // Salva o estado inicial
    ctx.translate(50, 50); // Move o ponto (0, 0) pro centro do canvas

    WaterBug(ctx, fillColor, strokeColor); // Desenha a formiga

    ctx.restore(); // Restaura o contexto pro estado original

  }, [fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
