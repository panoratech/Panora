import { create } from 'zustand';

interface StytchOrgState {
  orgName: string;
  setOrgName: (id: string) => void;
}

const useStytchOrgStore = create<StytchOrgState>()((set) => ({
    orgName: "",
    setOrgName: (name) => set({ orgName: name }),
}));

export default useStytchOrgStore;
