import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Download, Loader2 } from 'lucide-react';

interface SidebarProps {
  onAddImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSelected: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDownload: () => void;
  isProcessing: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  onAddImage,
  onDeleteSelected,
  onBringToFront,
  onSendToBack,
  onDownload,
  isProcessing
}) => {
  return (
    <div className="w-full lg:w-80 h-full border-t lg:border-t-0 lg:border-r border-black p-8 flex flex-col gap-8 bg-white overflow-y-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-light tracking-tighter uppercase mb-2">Editor</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
          Minimalist outfit builder. Add photos and arrange them on the canvas.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className={`
          flex items-center justify-center gap-2 px-6 py-4 
          bg-black text-white hover:bg-gray-900 transition-colors 
          cursor-pointer uppercase text-sm font-medium tracking-tight
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}>
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Usuwanie tła...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Dodaj ubranie
            </>
          )}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={onAddImage}
            disabled={isProcessing}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={onBringToFront}
          className="flex items-center justify-center gap-2 p-3 border border-black hover:bg-gray-100 transition-colors text-xs uppercase font-medium tracking-tight"
        >
          <ArrowUp className="w-3 h-3" />
          Na wierzch
        </button>
        <button 
          onClick={onSendToBack}
          className="flex items-center justify-center gap-2 p-3 border border-black hover:bg-gray-100 transition-colors text-xs uppercase font-medium tracking-tight"
        >
          <ArrowDown className="w-3 h-3" />
          Pod spód
        </button>
      </div>

      <button 
        onClick={onDeleteSelected}
        className="flex items-center justify-center gap-2 p-4 border border-black text-red-600 hover:bg-red-50 transition-colors text-xs uppercase font-medium tracking-tight"
      >
        <Trash2 className="w-4 h-4" />
        Usuń zaznaczone
      </button>

      <div className="mt-auto pt-8">
        <button 
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 p-5 border-2 border-black bg-white hover:bg-gray-100 transition-colors uppercase text-sm font-bold tracking-widest"
        >
          <Download className="w-4 h-4" />
          Pobierz Outfit
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
