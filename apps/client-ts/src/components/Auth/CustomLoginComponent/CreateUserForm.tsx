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
import { PasswordInput } from '@/components/ui/password-input'
import useCreateUser from '@/hooks/create/useCreateUser'

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
    password : z.string().min(2, {
    message: "Enter Password.",
    }),
    
})

const CreateUserForm = () => {

    const {mutate : createUserMutate} = useCreateUser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name:'',
            last_name:'',
            email:'',
            password:''
        },   
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // console.log(values)
        createUserMutate({
            first_name:values.first_name,
            last_name:values.last_name,
            email:values.email,
            strategy:'b2c',
            password_hash:values.password
        },
    {
        onSuccess:() => {
            form.reset();
        }
    });


    }


  return (
    <>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                Create your account.
                </CardDescription>
            </CardHeader>
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
                                <PasswordInput {...field} placeholder='Enter Password' /> 
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            </CardContent>
            <CardFooter>
                <Button type='submit' size="sm" className="h-7 gap-1" >Create an account</Button>
            </CardFooter>
        </Card>
        </form>
        </Form>
    </>
  )
}

export default CreateUserForm