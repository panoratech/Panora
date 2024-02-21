import { useMutation } from '@tanstack/react-query';

import { LoginSchemaType } from '@/components/auth/login/login-schema';
import { useCallback } from 'react';
import { useStytch } from '@stytch/react';

const useLoginMutation = () => {
  const stytchClient = useStytch();

  const authenticatePassword = useCallback(
    (data: LoginSchemaType) => {
      return stytchClient.passwords.authenticate({
        email: data.email,
        password: data.password,
        session_duration_minutes: 60,
      });
    },
    [stytchClient]
  );

  return useMutation({
    mutationFn: authenticatePassword,
  });
};

export default useLoginMutation;
