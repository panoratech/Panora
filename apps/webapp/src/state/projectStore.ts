import { create } from 'zustand';

interface ProjectState {
  idProject: string;
  setIdProject: (id: string) => void;
}

const useProjectStore = create<ProjectState>()((set) => ({
  idProject: "",
  setIdProject: (id) => set({ idProject: id }),
}));

export default useProjectStore;
