'use client';

import React, { Suspense } from 'react';
import ResetPasswordForm from '@/components/Auth/CustomLoginComponent/ResetPasswordForm';
import { useSearchParams } from 'next/navigation';

const SearchParamsWrapper = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token) {
    return <div>Invalid or missing reset token. Please try the password reset process again.</div>;
  }
  if (!email) {
    return <div>Invalid or missing email. Please try the password reset process again.</div>;
  }

  return <ResetPasswordForm token={token} email={email} />;
};

const ResetPasswordPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-md w-full'>
        <Suspense fallback={<div>Loading...</div>}>
          <SearchParamsWrapper />
        </Suspense>
      </div>
    </div>
  );
};

export default ResetPasswordPage;