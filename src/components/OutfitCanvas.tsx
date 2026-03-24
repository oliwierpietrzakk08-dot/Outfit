import React, { useLayoutEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface OutfitCanvasProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
}

const OutfitCanvas: React.FC<OutfitCanvasProps> = ({ onCanvasReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useLayoutEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const canvasWidth = containerWidth;
    const canvasHeight = (canvasWidth * 5) / 4;

    // Dispose old canvas if exists
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#000000',
      cornerStrokeColor: '#000000',
      cornerStyle: 'rect',
      cornerSize: 8,
      padding: 5,
      borderDashArray: [3, 3],
      borderColor: '#000000',
    });

    fabricCanvasRef.current = fabricCanvas;
    onCanvasReady(fabricCanvas);

    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || 0;
      if (newWidth > 0) {
        const newHeight = (newWidth * 5) / 4;
        fabricCanvas.setDimensions({ width: newWidth, height: newHeight });
        fabricCanvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [onCanvasReady]);

  return (
    <div ref={containerRef} className="w-full max-w-[500px] mx-auto bg-white border border-black aspect-[4/5] relative">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default OutfitCanvas;
