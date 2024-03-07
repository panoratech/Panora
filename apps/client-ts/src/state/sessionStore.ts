import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id_user: string;
  email: string;
  first_name: string;
  last_name: string;
  id_organization?: string;
}

interface Session {
  user: User;
  accessToken: string;
}

interface SessionState {
  session: Session | null;
  setSession: (session: Session) => void;
}

export const useSessionStore = create(
  persist<SessionState>(
    (set) => ({
      session: null,
      setSession(session) {
        set({ session });
      },
    }),
    { name: 'session' }
  )
);

export default useSessionStore;
