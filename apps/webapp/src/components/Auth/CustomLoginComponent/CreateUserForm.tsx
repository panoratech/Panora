"use client"
import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PasswordInput } from '@/components/ui/password-input'
import useCreateUser from '@/hooks/create/useCreateUser'
import useCreateLogin from '@/hooks/create/useCreateLogin'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import useProfileStore from '@/state/profileStore'
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const formSchema = z.object({
    first_name: z.string().min(2,{
        message:"Enter First Name"
    }),
    last_name : z.string().min(2, {
        message: "Enter Last Name.",
    }),
    email : z.string().email({
        message: "Enter valid Email.",
    }),
    password : z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and privacy policy.",
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

interface SignupResponse {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface LoginResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
    }
}

const CreateUserForm = () => {
    const {createUserPromise} = useCreateUser();
    const {loginPromise} = useCreateLogin();
    const queryClient = useQueryClient();
    const router = useRouter();
    const {setProfile} = useProfileStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name:'',
            last_name:'',
            email:'',
            password:'',
            confirmPassword: '',
            acceptTerms: false
        },   
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // First register the user and wait for the response
            const signupResponse = await createUserPromise({
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                strategy: 'b2c',
                password_hash: values.password
            });

            // Show success message for signup
            toast.success('Account created successfully!');

            try {
                // Then attempt to log in
                const loginResponse = await loginPromise({
                    email: values.email,
                    password_hash: values.password
                }) as LoginResponse;

                // Set the access token
                if (loginResponse.access_token) {
                    Cookies.set('access_token', loginResponse.access_token);
                    setProfile({
                        id_user: loginResponse.user.id,
                        email: loginResponse.user.email,
                        first_name: loginResponse.user.first_name,
                        last_name: loginResponse.user.last_name
                    });
                    router.replace('/connections');
                    toast.success('Logged in successfully!');
                }
            } catch (loginError: any) {
                toast.error('Account created but login failed. Please try logging in manually.');
                console.error('Login error:', loginError);
            }
        } catch (error: any) {
            toast.error(error.message || 'Error creating account');
            console.error('Signup error:', error);
        }
    };

    return (
        <>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-0 shadow-none">
                <CardContent className="space-y-2">
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                        <FormField
                            name="first_name"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                    <Input {...field} placeholder='Enter first Name' /> 
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        </div>
                        <div className="grid gap-2">
                        <FormField
                            name="last_name"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                    <Input {...field} placeholder='Enter Last Name' /> 
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                    <Input {...field} placeholder='Enter Email' /> 
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid gap-2">
                        <FormField
                            name="password"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} placeholder='Enter Password' /> 
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid gap-2">
                        <FormField
                            name="confirmPassword"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} placeholder='Confirm Password' /> 
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid gap-2">
                        <FormField
                            control={form.control}
                            name="acceptTerms"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            I accept the{" "}
                                            <Link href="https://panora.dev/terms" target="_blank" className="underline">
                                                Terms of Service
                                            </Link>
                                            {" "}and{" "}
                                            <Link href="https://panora.dev/privacy" target="_blank" className="underline">
                                                Privacy Policy
                                            </Link>
                                        </FormLabel>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                </CardContent>
                <CardFooter>
                    <Button type='submit' size="sm" className="h-7 gap-1">
                        Create an account
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
            </form>
            </Form>
        </>
    )
}

export default CreateUserForm