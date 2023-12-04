import { create } from 'zustand';

export const projects = [
  {
    label: "Financial Project",
    value: "personal",
  },
  {
    label: "Data Project",
    value: "personal1",
  },
  {
    label: "Marketing Project",
    value: "personal2",
  },
];

interface ProjectT {
  label: string;
  value: string;
}

interface ProjectState {
  selectedProject: ProjectT;
  setSelectedProject: (project: ProjectT) => void;
}

const useProjectStore = create<ProjectState>()((set) => ({
  selectedProject: projects[0],
  setSelectedProject: (project: ProjectT) => set({ selectedProject: project }),
}));

export default useProjectStore;
