import { create } from 'zustand';

type User_ = {
  id_user: string;
  email: string;
  first_name: string;
  last_name: string;
  id_organization?: string;
}

interface ProfileState {
  profile: User_ | null;
  setProfile: (profile: User_ | null) => void;
}


const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  setProfile: (profile_: User_ | null) => set({ profile: profile_ }),
}));

export default useProfileStore;
