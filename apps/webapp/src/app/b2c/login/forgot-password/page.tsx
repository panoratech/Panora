'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import ResetPasswordForm from '@/components/Auth/CustomLoginComponent/ResetPasswordForm';
import ForgotPasswordForm from '@/components/Auth/CustomLoginComponent/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-md w-full'>
        <ForgotPasswordForm/>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;