import { create } from 'zustand';
import {projects as Project} from "@api/exports";

interface ProjectState {
  selectedProject: Project | null;
  setSelectedProject: (project: Project) => void;
}

const useProjectStore = create<ProjectState>()((set) => ({
  selectedProject: null,
  setSelectedProject: (project: Project) => set({ selectedProject: project }),
}));

export default useProjectStore;
