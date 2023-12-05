import { create } from 'zustand';

export const organisations = [
  {
    label: "Acme Inc.",
    value: "acme-inc",
  }
];

interface OrganisationT {
  label: string;
  value: string;
}

interface OrganisationState {
  selectedOrganisation: OrganisationT;
  setSelectedOrganisation: (org: OrganisationT) => void;
}

const useOrganisationStore = create<OrganisationState>()((set) => ({
  selectedOrganisation: organisations[0],
  setSelectedOrganisation: (org: OrganisationT) => set({ selectedOrganisation: org }),
}));

export default useOrganisationStore;
