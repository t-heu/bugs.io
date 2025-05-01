import React, { useEffect, useRef } from "react";

type DrawFunction = (ctx: CanvasRenderingContext2D, fillColor: string, strokeColor: string) => void;

interface InsectDrawingProps {
  draw: DrawFunction;
  fillColor: string;
  strokeColor: string;
}

export const InsectDrawing = ({ draw, fillColor, strokeColor }: InsectDrawingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(50, 50); // centraliza o desenho
    draw(ctx, fillColor, strokeColor);
    ctx.restore();
  }, [draw, fillColor, strokeColor]);

  return <canvas ref={canvasRef} width={100} height={100} />;
};
