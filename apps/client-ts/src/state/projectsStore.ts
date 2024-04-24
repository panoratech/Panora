import { create } from 'zustand';
import { projects as Project } from 'api';

interface ProjectsState {
  projects: Project[] | null;
  setProjects: (projects: Project[]) => void;
}

const useProjectsStore = create<ProjectsState>()((set) => ({
    projects: [],
    setProjects: (projects: Project[]) => set({ projects: projects }),
}));

export default useProjectsStore;
