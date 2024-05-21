import { create } from 'zustand';

interface VerticalState {
  vertical: string;
  setVertical: (name: string) => void;
}

const useVerticalStore = create<VerticalState>()((set) => ({
  vertical: "All",
  setVertical: (name) => set({ vertical: name }),
}));

export default useVerticalStore;
