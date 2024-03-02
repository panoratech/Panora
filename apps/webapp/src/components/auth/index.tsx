import { Link } from 'react-router-dom';
import Image from '@/assets/bg-panora.jpeg';
import { Button } from '../ui/button';

export const AuthPage = () => {
  return (
    <div className='min-h-screen grid lg:grid-cols-2 mx-auto text-left'>
      <div className='flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
        <div className='mx-auto w-full max-w-sm lg:w-96'>
            <div className='text-center'>
                <Link to='/'>
                <img src='/logo.png' className='w-14 mx-auto' />
                </Link>
                <h2 className='text-3xl font-extrabold'>Welcome on Panora</h2>
                <div className='mt-2 text-sm p-2'>                    
                    <Link to='/auth/register' className='font-medium text-primary hover:text-primary/80'>
                        <Button type='submit' className='w-[30%] mr-4'>
                            Sign Up
                        </Button>    
                    </Link>
                    <Link to='/auth/login' className='mt-10 font-medium text-primary hover:text-primary/80'>
                        <Button type='submit' className='w-[30%]'>
                            Log In
                        </Button>    
                    </Link>
                </div>
            </div>
        </div>
      </div>
      <div className='hidden lg:block relative flex-1'>
        <img className='absolute inset-0 h-full w-full object-cover border-l' src={Image} alt='Login Page Image' />
      </div>
    </div>
  );
};
