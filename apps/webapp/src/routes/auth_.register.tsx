import { RegisterForm } from '@/components/auth/register/register-form';
import RegisterImage from '@/assets/register.jpeg';

export default function RegisterPage() {
  return (
    <div className='min-h-screen grid lg:grid-cols-2 mx-auto text-left'>
      <div className='flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
        <RegisterForm />
      </div>
      <div className='hidden lg:block relative flex-1'>
        <img className='absolute inset-0 h-full w-full object-cover' src={RegisterImage} alt='' />
      </div>
    </div>
  );
}
