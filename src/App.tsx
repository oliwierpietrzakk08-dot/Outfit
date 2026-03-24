import React, { useState, useCallback } from 'react';
import { fabric } from 'fabric';
import Sidebar from './components/Sidebar';
import OutfitCanvas from './components/OutfitCanvas';
import { processImage } from './utils/imageProcessing';

const App: React.FC = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCanvasReady = useCallback((fabricCanvas: fabric.Canvas) => {
    setCanvas(fabricCanvas);
  }, []);

  const handleAddImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;

    setIsProcessing(true);
    try {
      const imageUrl = await processImage(file);
      
      fabric.Image.fromURL(imageUrl, (img) => {
        // Initial scaling to fit canvas reasonably
        const scale = Math.min(
          (canvas.width! * 0.5) / img.width!,
          (canvas.height! * 0.5) / img.height!
        );
        
        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          cornerSize: 8,
          transparentCorners: false,
          cornerColor: '#000',
          borderColor: '#000',
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setIsProcessing(false);
      }, { crossOrigin: 'anonymous' });
    } catch (error) {
      console.error('Failed to add image:', error);
      setIsProcessing(false);
    }
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.renderAll();
    }
  };

  const handleBringToFront = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.bringToFront();
      canvas.renderAll();
    }
  };

  const handleSendToBack = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.sendToBack();
      canvas.renderAll();
    }
  };

  const handleDownload = () => {
    if (!canvas) return;
    
    // Deselect all before exporting
    canvas.discardActiveObject();
    canvas.renderAll();

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2, // High-res export
    });

    const link = document.createElement('a');
    link.download = `outfit-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden">
      <Sidebar 
        onAddImage={handleAddImage}
        onDeleteSelected={handleDeleteSelected}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onDownload={handleDownload}
        isProcessing={isProcessing}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-auto bg-[#fafafa]">
        <div className="w-full max-w-[600px] flex flex-col gap-4">
          <div className="flex justify-between items-end border-b border-black pb-2 px-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Canvas 4:5</span>
            <span className="text-[10px] uppercase font-medium text-gray-400">Untitled Project</span>
          </div>
          
          <OutfitCanvas onCanvasReady={handleCanvasReady} />
          
          <div className="flex justify-between items-start pt-2 px-1">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-gray-400 tracking-wider">Instructions</span>
              <span className="text-[10px] uppercase font-medium">Drag, scale or rotate elements</span>
            </div>
            <span className="text-[10px] uppercase font-bold">1:1 Scale</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
