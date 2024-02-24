import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/connections/components/LoadingSpinner';

import useRegisterMutation from '@/hooks/mutations/useRegisterMutations';
import useLoginMutation from '@/hooks/mutations/useLoginMutation';
import { type RegisterSchemaType, registerSchema } from './register-schema';

export const RegisterUserForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { mutate: register, isPending: registerPending } = useRegisterMutation();
  const { mutateAsync: login, isPending: loginPending } = useLoginMutation();

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterSchemaType) => {
    register(data, {
      onSuccess: async () => {
        const loginData = {
          email: data.email,
          password: data.password,
        };

        await login(loginData, {
          onSuccess: () => {
            // Change Register Step To Create Organization
            onSuccess();
          },
        });
      },
    });
  };

  return (
    <div className='mx-auto w-full max-w-sm lg:w-96'>
      <div className='text-center'>
        <Link to='/'>
          <img src='/logo.png' className='w-14 mx-auto' />
        </Link>
        <h2 className='mt-6 text-3xl font-extrabold'>Create an account</h2>
        <p className='mt-2 text-sm'>
          Already have an account?{' '}
          <Link to='/auth/login' className='font-medium text-primary hover:text-primary/80'>
            Login
          </Link>
        </p>
      </div>

      <Form {...form}>
        <form className='space-y-6 mt-8' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor='firstName'>First name</FormLabel>
                  <FormControl>
                    <Input placeholder='Jane' autoComplete='given-name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor='lastName'>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder='Doe' autoComplete='family-name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <Button type='submit' className='w-full' disabled={registerPending || loginPending}>
            {registerPending || loginPending ? <LoadingSpinner className='' /> : 'Create account'}
          </Button>
        </form>
      </Form>
    </div>
  );
};
