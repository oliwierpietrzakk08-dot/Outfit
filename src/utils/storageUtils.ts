export interface Project {
  id: string;
  name: string;
  canvasData?: string; // JSON string from fabric.Canvas.toJSON()
  updatedAt: number;
}

const STORAGE_KEY = 'outfit_projects';

export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveProject = (project: Project) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  
  if (index !== -1) {
    projects[index] = { ...project, updatedAt: Date.now() };
  } else {
    projects.push({ ...project, updatedAt: Date.now() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const deleteProject = (id: string) => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const createNewProject = (): Project => {
  const newProject: Project = {
    id: `project_${Date.now()}`,
    name: `New Outfit ${new Date().toLocaleDateString()}`,
    updatedAt: Date.now()
  };
  saveProject(newProject);
  return newProject;
};
