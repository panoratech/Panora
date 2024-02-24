import { useState } from 'react';

import { RegisterUserForm } from './register-user-form';
import { CreateOrganizationForm } from './create-organization-form';

export const RegisterForm = () => {
  const [registered, setIsRegistered] = useState(false);

  if (!registered) return <RegisterUserForm onSuccess={() => setIsRegistered(true)} />;

  return <CreateOrganizationForm />;
};
