import React from 'react';
import type { Project } from '../utils/storageUtils';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import Logo from './Logo';

interface DashboardProps {
  projects: Project[];
  onCreateProject: () => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onCreateProject,
  onSelectProject,
  onDeleteProject
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col p-8 md:p-16 max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-end mb-16 border-b border-black pb-8">
        <Logo />
        <button 
          onClick={onCreateProject}
          className="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 uppercase text-sm font-bold tracking-widest hover:bg-gray-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Stwórz nowy projekt
        </button>
      </header>

      <main className="flex-1">
        <h2 className="text-sm uppercase font-bold tracking-widest mb-8 text-gray-400">Twoje Projekty ({projects.length})</h2>
        
        {projects.length === 0 ? (
          <div className="h-64 border border-dashed border-gray-300 flex flex-col items-center justify-center gap-4 text-gray-400">
            <p className="uppercase text-xs tracking-widest">Brak zapisanych projektów</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <div 
                key={project.id}
                className="group border border-black p-6 flex flex-col gap-4 bg-white hover:bg-gray-50 transition-all cursor-pointer relative"
                onClick={() => onSelectProject(project.id)}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase text-gray-400 font-medium">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project.id);
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-medium tracking-tight uppercase leading-tight group-hover:underline">
                    {project.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-[10px] uppercase font-bold tracking-widest">Edytuj</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
