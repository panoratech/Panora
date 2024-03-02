import Image from '@/assets/bg-panora.jpeg';
import { SignupForm } from './SignupForm';

export default function SignupPage() {
  const protocol = window.location.protocol; // "http:" or "https:"
  const host = window.location.host; // Includes hostname and port if present
  const domain = `${protocol}//${host}`;
  
  return (
    <div className='min-h-screen grid lg:grid-cols-2 mx-auto text-left'>
      <div className='flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
        <SignupForm domain={domain}/>
      </div>
      <div className='hidden lg:block relative flex-1'>
        <img className='absolute inset-0 h-full w-full object-cover' src={Image} alt='Registration Page Image' />
      </div>
    </div>
  );
}