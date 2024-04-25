import { create } from 'zustand';
import { projects as Project } from 'api';

type User_ = User & { projects: Project[] };
type User = {
  id_user: string;
  email: string;
  first_name: string;
  last_name: string;
  id_organization?: string;
}

interface ProfileState {
  profile: User_  | null;
  setProfile: (profile: User_) => void;
}


const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  setProfile: (profile_: User_) => set({ profile: profile_ }),
}));

export default useProfileStore;
