import { create } from 'zustand';

interface OrganisationState {
  idOrg: string;
  setIdOrg: (id: string) => void;
  nameOrg: string;
  setOrganisationName: (id: string) => void;
}

const useOrganisationStore = create<OrganisationState>()((set) => ({
  idOrg: '000',
  setIdOrg: (id) => set({ idOrg: id }),
  nameOrg: 'org',
  setOrganisationName: (name) => set({ nameOrg: name })
}))

export default useOrganisationStore;
