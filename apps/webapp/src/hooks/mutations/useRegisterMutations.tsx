import { RegisterSchemaType } from '@/components/auth/register/register-schema';
import { type User } from '@/state/sessionStore';
import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';

const registerReq = async (data: RegisterSchemaType): Promise<User> => {
  const response = await fetch(`${config.API_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password_hash: data.password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to Register');
  }

  return response.json();
};

const useRegisterMutation = () => {
  return useMutation({
    mutationFn: registerReq,
  });
};

export default useRegisterMutation;
