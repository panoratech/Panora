import { create } from 'zustand';

export interface Project {
  id_project: string;
  name: string;
  sync_mode: string;
  pull_frequency: string;
  redirect_url?: string;
  id_user: string;
}

interface ProjectsState {
  projects: Project[] | null;
  setProjects: (projects: Project[]) => void;
}

const useProjectsStore = create<ProjectsState>()((set) => ({
    projects: null,
    setProjects: (projects: Project[]) => set({ projects: projects }),
}));

export default useProjectsStore;
