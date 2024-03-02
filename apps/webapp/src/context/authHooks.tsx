import { useContext } from 'react';
import { AuthContext } from './auth';

export const useAuth = () => useContext(AuthContext);