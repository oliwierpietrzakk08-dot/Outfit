import React, { useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import Sidebar from './components/Sidebar';
import OutfitCanvas from './components/OutfitCanvas';
import Dashboard from './components/Dashboard';
import { processImage } from './utils/imageProcessing';
import { 
  getProjects, 
  saveProject, 
  deleteProject, 
  createNewProject 
} from './utils/storageUtils';
import type { Project } from './utils/storageUtils';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load projects on mount
  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleCanvasReady = useCallback((fabricCanvas: fabric.Canvas) => {
    setCanvas(fabricCanvas);
    
    // Load existing data if current project has it
    if (currentProject?.canvasData) {
      fabricCanvas.loadFromJSON(currentProject.canvasData, () => {
        fabricCanvas.renderAll();
      });
    }
  }, [currentProject]);

  // Auto-save project data
  useEffect(() => {
    if (!canvas || !currentProject) return;

    const handleCanvasChange = () => {
      const canvasData = JSON.stringify(canvas.toJSON());
      const updatedProject = { ...currentProject, canvasData };
      saveProject(updatedProject);
      setCurrentProject(updatedProject);
    };

    canvas.on('object:modified', handleCanvasChange);
    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);

    return () => {
      canvas.off('object:modified', handleCanvasChange);
      canvas.off('object:added', handleCanvasChange);
      canvas.off('object:removed', handleCanvasChange);
    };
  }, [canvas, currentProject]);

  const addImageToCanvas = async (file: File) => {
    if (!canvas) return;
    setIsProcessing(true);
    try {
      const imageUrl = await processImage(file);
      fabric.Image.fromURL(imageUrl, (img) => {
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

  // Keyboard Paste Handler
  useEffect(() => {
    const handlePaste = (e: Event) => {
      const clipboardEvent = e as ClipboardEvent;
      if (view !== 'editor') return;
      const items = clipboardEvent.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) addImageToCanvas(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [view, canvas]);

  // Drag and Drop Handlers
  useEffect(() => {
    const handleDragOver = (e: Event) => {
      if (view !== 'editor') return;
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: Event) => {
      if (view !== 'editor') return;
      const dragEvent = e as DragEvent;
      dragEvent.preventDefault();
      dragEvent.stopPropagation();
      const files = dragEvent.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          addImageToCanvas(file);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [view, canvas]);

  const handleCreateProject = () => {
    const newProj = createNewProject();
    setProjects(getProjects());
    setCurrentProject(newProj);
    setView('editor');
  };

  const handleSelectProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
      setView('editor');
    }
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    setProjects(getProjects());
    if (currentProject?.id === id) {
      setCurrentProject(null);
      setView('dashboard');
    }
  };

  const handleBackToDashboard = () => {
    setProjects(getProjects());
    setView('dashboard');
    setCurrentProject(null);
    setCanvas(null);
  };

  if (view === 'dashboard') {
    return (
      <Dashboard 
        projects={projects}
        onCreateProject={handleCreateProject}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden">
      <Sidebar 
        onAddImage={(e) => {
          const file = e.target.files?.[0];
          if (file) addImageToCanvas(file);
        }}
        onDeleteSelected={() => {
          if (!canvas) return;
          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length) {
            canvas.discardActiveObject();
            activeObjects.forEach((obj) => canvas.remove(obj));
            canvas.renderAll();
          }
        }}
        onBringToFront={() => {
          if (!canvas) return;
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            activeObject.bringToFront();
            canvas.renderAll();
          }
        }}
        onSendToBack={() => {
          if (!canvas) return;
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            activeObject.sendToBack();
            canvas.renderAll();
          }
        }}
        onDownload={() => {
          if (!canvas) return;
          canvas.discardActiveObject();
          canvas.renderAll();
          const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0, multiplier: 2 });
          const link = document.createElement('a');
          link.download = `${currentProject?.name || 'outfit'}.png`;
          link.href = dataURL;
          link.click();
        }}
        onBackToDashboard={handleBackToDashboard}
        isProcessing={isProcessing}
        projectName={currentProject?.name || ''}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-auto bg-[#fafafa]">
        <div className="w-full max-w-[600px] flex flex-col gap-4">
          <div className="flex justify-between items-end border-b border-black pb-2 px-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Canvas 4:5</span>
            <span className="text-[10px] uppercase font-medium text-gray-400">
              Uzupełnij swój outfit
            </span>
          </div>
          
          <OutfitCanvas onCanvasReady={handleCanvasReady} />
          
          <div className="flex justify-between items-start pt-2 px-1">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-gray-400 tracking-wider">Metody</span>
              <span className="text-[10px] uppercase font-medium italic">Paste / Drop / Upload</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-tighter">Minimalism v1.1</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
