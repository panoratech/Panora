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
import { PasswordInput } from '@/components/ui/password-input'
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import useCreateLogin from '@/hooks/create/useCreateLogin'
import { useRouter } from "next/navigation";
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import useProfileStore from '@/state/profileStore';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowRight } from "lucide-react"

const formSchema = z.object({
    email: z.string().email({
        message:"Enter valid Email" 
    }),
    password : z.string().min(2, {
        message: "Enter Password.",
      }),
})

const LoginUserForm = () => {

    const router = useRouter()
    const queryClient = useQueryClient();
    const {loginPromise} = useCreateLogin()
    const {setProfile}= useProfileStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email:'',
            password:''
        },   
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        toast.promise(
            loginPromise({
                email:values.email,
                password_hash:values.password
            }), 
            {
            loading: 'Loading...',
            success: (data: any) => {
                setProfile(data.user);
                Cookies.set('access_token',data.access_token,{expires:1});
                router.replace("/connections");
                queryClient.setQueryData<any[]>(['users'], (oldQueryData = []) => {
                    return [...oldQueryData, data];
                });
                return (
                    <div className="flex flex-row items-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    <div className="ml-2">
                        User
                        <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">{`${values.email}`}</Badge>
                        has been logged in
                    </div>
                    </div>
                )
                ;
            },
            error: (err: any) => err.message || 'Error'
        });
    };

  return (
    <>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>

        <Card className="border-0 shadow-none">
            <CardContent className="space-y-2">
                    <div className="space-y-1">
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
                    <div >
                    <FormField
                        name="password"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                <PasswordInput {...field} placeholder='Enter Password' /> 
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    </div>
                
            </CardContent>
            <CardFooter>
                <Button type='submit' size="sm" className='h-7 gap-1'>
                    Login
                    <ArrowRight className="h-4 w-4" />
                </Button>
                <Link href="/b2c/login/forgot-password" className="text-sm ml-4 text-white-600 hover:underline">
                    Forgot Password?
                </Link>
            </CardFooter>
        </Card>
        </form>
        </Form>
    </>
  )
}

export default LoginUserForm