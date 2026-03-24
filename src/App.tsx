import React, { useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import Sidebar from './components/Sidebar';
import OutfitCanvas from './components/OutfitCanvas';
import Dashboard from './components/Dashboard';
import { removeBackground } from '@imgly/background-removal';
import { 
  getProjects, 
  saveProject, 
  deleteProject, 
  createNewProject 
} from './utils/storageUtils';
import type { Project } from './utils/storageUtils';

/**
 * App Component - Robust Version
 * Focused on error-proof image loading and detailed logging.
 */
const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    console.log('[App] Initializing: loading projects from localStorage');
    setProjects(getProjects());
  }, []);

  const handleCanvasReady = useCallback((fabricCanvas: fabric.Canvas) => {
    console.log('[App] Canvas ready');
    setCanvas(fabricCanvas);
    
    if (currentProject?.canvasData) {
      console.log('[App] Loading project state into canvas');
      try {
        fabricCanvas.loadFromJSON(currentProject.canvasData, () => {
          fabricCanvas.renderAll();
          console.log('[App] Project state loaded successfully');
        });
      } catch (err) {
        console.error('[App] Failed to load project data:', err);
      }
    }
  }, [currentProject]);

  // --- PERSISTENCE ---
  useEffect(() => {
    if (!canvas || !currentProject) return;

    const handleCanvasChange = () => {
      console.log('[App] Canvas content changed, auto-saving...');
      try {
        const canvasData = JSON.stringify(canvas.toJSON());
        const updatedProject = { ...currentProject, canvasData };
        saveProject(updatedProject);
        // Only update state if ID matches to avoid race conditions
        setCurrentProject(prev => prev?.id === updatedProject.id ? updatedProject : prev);
      } catch (err) {
        console.error('[App] Auto-save failed:', err);
      }
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

  // --- CORE LOGIC: IMAGE PROCESSING ---
  const addImageToCanvas = async (file: File) => {
    if (!canvas) {
      console.error('[App] Cannot add image: Canvas is not initialized');
      return;
    }

    console.log(`[App] Step 1: File selected - Name: ${file.name}, Size: ${file.size} bytes`);
    setIsProcessing(true);
    
    let processedUrl: string | null = null;

    // Background Removal Stage
    try {
      console.log('[App] Step 2: Starting background removal...');
      const blob = await removeBackground(file, {
        publicPath: 'https://static.img.ly/packages/@imgly/background-removal/1.7.0/dist/',
        progress: (key, current, total) => {
          if (current === total) console.log(`[App] BG Removal - ${key} completed`);
        }
      });
      processedUrl = URL.createObjectURL(blob);
      console.log('[App] Step 2: Background removal successful');
    } catch (error) {
      console.warn('[App] Step 2: Background removal failed, using original image as fallback.', error);
      processedUrl = URL.createObjectURL(file);
    }

    if (!processedUrl) {
      console.error('[App] Step 3: Failed to create image URL');
      setIsProcessing(false);
      return;
    }

    // Fabric.js Loading Stage
    try {
      console.log('[App] Step 3: Loading image into Fabric.js...');
      fabric.Image.fromURL(processedUrl, (img) => {
        if (!img) {
          console.error('[App] Step 4: Fabric failed to load image from URL');
          setIsProcessing(false);
          return;
        }

        console.log(`[App] Step 4: Image loaded - Dimensions: ${img.width}x${img.height}`);

        // Scaling logic: Fit into canvas nicely
        const scale = Math.min(
          (canvas.width! * 0.5) / img.width!,
          (canvas.height! * 0.5) / img.height!,
          1.0 // Don't upscale small images too much
        );

        img.set({
          scaleX: scale,
          scaleY: scale,
        });

        canvas.add(img);
        canvas.centerObject(img); // Essential centering
        canvas.setActiveObject(img);
        canvas.renderAll();
        
        console.log('[App] Step 5: Image successfully placed on canvas');
        setIsProcessing(false);
      }, { crossOrigin: 'anonymous' });
    } catch (err) {
      console.error('[App] Step 4: Error during Fabric.js processing:', err);
      setIsProcessing(false);
    }
  };

  // --- EVENT LISTENERS (PASTE & DROP) ---
  useEffect(() => {
    const handlePaste = (e: Event) => {
      if (view !== 'editor') return;
      console.log('[App] Paste event detected');
      const clipboardEvent = e as ClipboardEvent;
      const items = clipboardEvent.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              console.log('[App] Pasted image found');
              addImageToCanvas(blob);
            }
          }
        }
      }
    };

    const handleDragOver = (e: Event) => {
      if (view !== 'editor') return;
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: Event) => {
      if (view !== 'editor') return;
      console.log('[App] Drop event detected');
      const dragEvent = e as DragEvent;
      dragEvent.preventDefault();
      dragEvent.stopPropagation();
      const files = dragEvent.dataTransfer?.files;
      if (files && files.length > 0) {
        if (files[0].type.startsWith('image/')) {
          console.log('[App] Dropped image found');
          addImageToCanvas(files[0]);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [view, canvas]);

  // --- NAVIGATION & ACTIONS ---
  const handleCreateProject = () => {
    console.log('[App] Creating new project');
    const newProj = createNewProject();
    setProjects(getProjects());
    setCurrentProject(newProj);
    setView('editor');
  };

  const handleSelectProject = (id: string) => {
    console.log(`[App] Selecting project: ${id}`);
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
      setView('editor');
    }
  };

  const handleDeleteProject = (id: string) => {
    console.log(`[App] Deleting project: ${id}`);
    deleteProject(id);
    setProjects(getProjects());
    if (currentProject?.id === id) {
      handleBackToDashboard();
    }
  };

  const handleBackToDashboard = () => {
    console.log('[App] Navigating back to dashboard');
    setProjects(getProjects());
    setView('dashboard');
    setCurrentProject(null);
    setCanvas(null);
  };

  // --- RENDER HELPERS ---
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
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden text-black font-sans">
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
          console.log('[App] Exporting outfit to PNG');
          canvas.discardActiveObject();
          canvas.renderAll();
          const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0, multiplier: 2 });
          const link = document.createElement('a');
          link.download = `${currentProject?.name.replace(/\s+/g, '_') || 'outfit'}.png`;
          link.href = dataURL;
          link.click();
        }}
        onBackToDashboard={handleBackToDashboard}
        isProcessing={isProcessing}
        projectName={currentProject?.name || 'Untitled'}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-auto bg-[#fafafa]">
        <div className="w-full max-w-[600px] flex flex-col gap-4">
          {/* Header */}
          <div className="flex justify-between items-end border-b border-black pb-2 px-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Canvas 4:5</span>
            <span className="text-[10px] uppercase font-medium text-gray-400">
              Workspace
            </span>
          </div>
          
          {/* Main Canvas Component */}
          <div className="relative group">
            <OutfitCanvas onCanvasReady={handleCanvasReady} />
            {isProcessing && (
              <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center gap-4 z-50">
                <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse">
                  Przetwarzanie obrazu...
                </span>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-start pt-2 px-1">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-gray-400 tracking-wider">Metody</span>
              <span className="text-[10px] uppercase font-bold italic">Paste / Drop / Upload</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold tracking-tighter">Robust Builder v2.0</span>
              <span className="text-[8px] text-gray-300 uppercase">Automatic BG Removal + Fallback</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
