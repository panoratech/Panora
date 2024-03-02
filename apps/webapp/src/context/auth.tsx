import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '@/utils/config';
import { Member } from '@/lib/stytch/loadStytch';

type AuthContextProp = { isAuthenticated: boolean, user: Member | null, loading: boolean }

export const AuthContext = createContext<AuthContextProp>({ isAuthenticated: false, user: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        // Assuming you have an endpoint to verify the session
        const response = await axios.get(`${config.API_URL}/stytch/session/verify`);
        setIsAuthenticated(response.data.isAuthenticated);
        setUser(response.data.member); // Set user data based on the server response
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        console.error('Session verification failed', error);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};