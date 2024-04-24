import { create } from 'zustand';

interface User {
  id_user: string;
  email: string;
  first_name: string;
  last_name: string;
  id_organization?: string;
}

interface ProfileState {
  profile: User | null;
  setProfile: (profile: User) => void;
}


const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  setProfile: (profile_: User) => set({ profile: profile_ }),
}));

export default useProfileStore;
