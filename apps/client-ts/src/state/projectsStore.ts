import { create } from 'zustand';

export interface Project {
    id_project: string;
    name: string;
    sync_mode: string;
    pull_frequency?: bigint | null;
    redirect_url?: string | null;
    id_user: string;
}

interface ProjectsState {
    projects: Project[] | null;
    setProjects: (projects: Project[]) => void;
}

const useProjectsStore = create<ProjectsState>()((set) => ({
    projects: [],
    setProjects: (projects: Project[]) => set({ projects: projects }),
}));

export default useProjectsStore;