import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import useInitiatePasswordRecovery from '@/hooks/create/useInitiatePasswordRecovery';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter valid Email' }),
});

const ForgotPasswordForm = () => {
  const { func } = useInitiatePasswordRecovery();

  const sform = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast.promise(
      func({ email: values.email }),
      {
        loading: 'Sending recovery email...',
        success: 'Recovery email sent. Please check your inbox.',
        error: 'Failed to send recovery email. Please try again.',
      }
    );
  };

  return (
    <Form {...sform}>
      <form onSubmit={sform.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your email to reset your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              name="email"
              control={sform.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter Email' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type='submit' size="sm" className='h-7 gap-1'>Send Recovery Email</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;