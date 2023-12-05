/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

interface ProjectState {
  selectedProject: any;
  setSelectedProject: (project: any) => void;
}

const useProjectStore = create<ProjectState>()((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));

export default useProjectStore;
