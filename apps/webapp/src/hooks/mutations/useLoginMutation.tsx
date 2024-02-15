import { useMutation } from '@tanstack/react-query';

import config from '@/utils/config';

import { LoginSchemaType } from '@/components/auth/login/login-schema';
import useSessionStore, { type User } from '@/state/sessionStore';

interface LoginResponse {
  user: User;
  access_token: string;
}

async function loginReq(data: LoginSchemaType): Promise<LoginResponse> {
  const response = await fetch(`${config.API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      password_hash: data.password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to Login');
  }

  return response.json();
}

const useLoginMutation = () => {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: loginReq,
    onSuccess: (data) => {
      setSession({
        user: data.user,
        accessToken: data.access_token,
      });
    },
  });
};

export default useLoginMutation;
