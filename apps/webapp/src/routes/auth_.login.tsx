import LoginImage from '@/assets/login.jpeg';
import { LoginUserForm } from '@/components/auth/login/login-user-form';

export default function LoginPage() {
  return (
    <div className='min-h-screen grid lg:grid-cols-2 mx-auto text-left'>
      <div className='hidden lg:block relative flex-1'>
        <img className='absolute inset-0 h-full w-full object-cover border-l' src={LoginImage} alt='Login Page Image' />
      </div>
      <div className='flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
        <LoginUserForm />
      </div>
    </div>
  );
}
