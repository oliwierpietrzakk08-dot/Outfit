import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Download, Loader2, ChevronLeft } from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  onAddImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSelected: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDownload: () => void;
  onBackToDashboard: () => void;
  isProcessing: boolean;
  projectName: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onAddImage,
  onDeleteSelected,
  onBringToFront,
  onSendToBack,
  onDownload,
  onBackToDashboard,
  isProcessing,
  projectName
}) => {
  return (
    <div className="w-full lg:w-80 h-full border-t lg:border-t-0 lg:border-r border-black p-8 flex flex-col gap-8 bg-white overflow-y-auto">
      <div className="flex flex-col gap-6">
        <button 
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest hover:underline mb-2"
        >
          <ChevronLeft className="w-3 h-3" />
          Wróć do projektów
        </button>
        
        <Logo />
        
        <div className="mt-2">
          <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-1">Projekt</span>
          <h2 className="text-sm font-medium uppercase tracking-tight truncate border-b border-gray-100 pb-2">
            {projectName}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className={`
          flex items-center justify-center gap-2 px-6 py-4 
          bg-black text-white hover:bg-gray-900 transition-colors 
          cursor-pointer uppercase text-sm font-bold tracking-tight
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}>
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Przetwarzanie...
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
          className="flex items-center justify-center gap-2 p-3 border border-black hover:bg-gray-100 transition-colors text-[10px] uppercase font-bold tracking-tight"
        >
          <ArrowUp className="w-3 h-3" />
          Na wierzch
        </button>
        <button 
          onClick={onSendToBack}
          className="flex items-center justify-center gap-2 p-3 border border-black hover:bg-gray-100 transition-colors text-[10px] uppercase font-bold tracking-tight"
        >
          <ArrowDown className="w-3 h-3" />
          Pod spód
        </button>
      </div>

      <button 
        onClick={onDeleteSelected}
        className="flex items-center justify-center gap-2 p-4 border border-black text-red-600 hover:bg-red-50 transition-colors text-[10px] uppercase font-bold tracking-tight"
      >
        <Trash2 className="w-3 h-3" />
        Usuń zaznaczone
      </button>

      <div className="mt-auto pt-8 flex flex-col gap-4">
        <button 
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 p-5 border-2 border-black bg-white hover:bg-gray-100 transition-colors uppercase text-sm font-black tracking-widest"
        >
          <Download className="w-4 h-4" />
          Pobierz Outfit
        </button>
        
        <div className="text-[8px] text-gray-400 uppercase tracking-widest text-center leading-relaxed">
          Ctrl+V - wklej ze schowka<br/>
          Przeciągnij plik - dodaj zdjęcie
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
