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
import { Label } from "@/components/ui/label"
import { PasswordInput } from '@/components/ui/password-input'
import * as z from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import useLoginMutation from '@/hooks/mutations/useLoginMutation'
import { useRouter } from "next/navigation";

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

    const {mutate : loginMutate} = useLoginMutation()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email:'',
            password:''
        },   
    })

const onSubmit = (values: z.infer<typeof formSchema>) => {

    loginMutate({
        email:values.email,
        password_hash:values.password
    },
    {
        onSuccess: () => router.replace("/connections")
    })
    
}



  return (
    <>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>

        <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                Enter your Email and Password to login.
                </CardDescription>
            </CardHeader>
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
                <Button type='submit'>Login</Button>
            </CardFooter>
        </Card>
        </form>
        </Form>
    </>
  )
}

export default LoginUserForm