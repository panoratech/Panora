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
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PasswordInput } from '@/components/ui/password-input'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useQueryClient } from '@tanstack/react-query'
import useChangePassword from '@/hooks/create/useChangePassword'
import useProfileStore from '@/state/profileStore'

const formSchema = z.object({
    old_password: z.string().min(2, {
        message: "Enter Your Password.",
    }),
    new_password: z.string().min(2, {
        message: "Enter New passowrd.",
    }),
})

const ChangePasswordForm = () => {
    const { changePasswordPromise } = useChangePassword();
    const { profile } = useProfileStore();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            old_password: '',
            new_password: ''
        },
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (!profile?.id_user || !profile?.email) {
            throw new Error("Profile ID or email is missing.");
        }

        toast.promise(
            changePasswordPromise({
                id_user: profile.id_user,
                email: profile.email,
                old_password_hash: values.old_password,
                new_password_hash: values.new_password,
            }),
            {
                loading: 'Loading...',
                success: (data: any) => {
                    form.reset();
                    queryClient.setQueryData<any[]>(['users'], (oldQueryData = []) => {
                        return [...oldQueryData, data];
                    });
                    return (
                        <div className="flex flex-row items-center">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                            <div className="ml-2">
                                Password for user
                                <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">
                                    {`${profile?.email}`}
                                </Badge>
                                has been updated successfully
                            </div>
                        </div>
                    );
                },
                error: (err: any) => err.message || 'Error'
            });
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <FormField
                                        name="old_password"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password</FormLabel>
                                                <FormControl>
                                                    <PasswordInput {...field} placeholder='Current Password' />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <FormField
                                        name="new_password"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <PasswordInput {...field} placeholder='New Password' autoComplete="new-password" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type='submit' size="sm" className="h-7 gap-1" >Save</Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </>
    )
}

export default ChangePasswordForm