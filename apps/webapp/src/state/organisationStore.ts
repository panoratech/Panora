/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

interface OrganisationState {
  selectedOrganisation: any;
  setSelectedOrganisation: (org: any) => void;
}

const useOrganisationStore = create<OrganisationState>()((set) => ({
  selectedOrganisation: null,
  setSelectedOrganisation: (org) => set({ selectedOrganisation: org }),
}));

export default useOrganisationStore;
