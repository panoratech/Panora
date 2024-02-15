import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/connections/components/LoadingSpinner';

import useLoginMutation from '@/hooks/mutations/useLoginMutation';
import { type LoginSchemaType, loginSchema } from './login-schema';

export const LoginUserForm = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending: loginPending } = useLoginMutation();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchemaType) => {
    const loginData = {
      email: data.email,
      password: data.password,
    };

    login(loginData, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  return (
    <div className='mx-auto w-full max-w-sm lg:w-96'>
      <div className='text-center'>
        <Link to='/'>
          <img src='/logo.png' className='w-14 mx-auto' />
        </Link>
        <h2 className='mt-6 text-3xl font-extrabold'>Login</h2>
        <p className='mt-2 text-sm'>
          Don&apos;t have an account?{' '}
          <Link to='/auth/register' className='font-medium text-primary hover:text-primary/80'>
            Register
          </Link>
        </p>
      </div>

      <Form {...form}>
        <form className='space-y-6 mt-8' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='email'>Email</FormLabel>
                <FormControl>
                  <Input placeholder='panora@example.com' autoComplete='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='password'>Password</FormLabel>
                <FormControl>
                  <Input placeholder='********' type='password' autoComplete='current-password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Link to='/auth/forgot-password' className='font-medium block text-sm text-primary hover:text-primary/80'>
            Forgot your password?
          </Link>

          <Button type='submit' className='w-full' disabled={loginPending}>
            {loginPending ? <LoadingSpinner className='' /> : 'Login'}
          </Button>
        </form>
      </Form>
    </div>
  );
};
