/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

interface ProjectState {
  idProject: string;
  setIdProject: (id: string) => void;
}

const useProjectStore = create<ProjectState>()((set) => ({
  idProject: "123",
  setIdProject: (id) => set({ idProject: id }),
}));

export default useProjectStore;
