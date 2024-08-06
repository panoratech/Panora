'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import ResetPasswordForm from '@/components/Auth/CustomLoginComponent/ResetPasswordForm';

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  if (!token) {
    return <div>Invalid or missing reset token. Please try the password reset process again.</div>;
  }
  if (!email) {
    return <div>Invalid or missing email. Please try the password reset process again.</div>;
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-md w-full'>
        <ResetPasswordForm token={token} email={email} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;