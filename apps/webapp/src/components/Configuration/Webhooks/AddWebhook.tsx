'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import useProjectStore from "@/state/projectStore"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
import { DataTableFacetedFilterWebhook } from "../../shared/data-table-webhook-scopes"
import useCreateWebhook from "@/hooks/create/useCreateWebhook"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useQueryClient } from "@tanstack/react-query"


const formSchema = z.object({
    description: z.string().min(2, {
      message: "description must be at least 2 characters.",
    }),
    url: z.string().min(2, {
        message: "url must be at least 2 characters.",
    }),
    scopes: z.string(),
})

const AddWebhook = () => {
    const [open, setOpen] = useState(false);
    
    const posthog = usePostHog()

    const {idProject} = useProjectStore();
    const queryClient = useQueryClient();

    const { createWebhookPromise } = useCreateWebhook();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          description: "",
          url: "",
          scopes: "",
        },
      })
    

    const handleOpenChange = (openVal : boolean) => {
        setOpen(openVal);
        form.reset();
      };
    
    function onSubmit(values: z.infer<typeof formSchema>) {
        const selectedScopes = values.scopes ? values.scopes.split(' ') : [];
        console.log({ ...values, scopes: selectedScopes });
        toast.promise(
            createWebhookPromise({
                url: values.url,
                description: values.description,
                scope: selectedScopes,
            }),
            {
            loading: 'Loading...',
            success: (data: any) => {
              queryClient.setQueryData<any[]>(['webhooks'], (oldQueryData = []) => {
                return [...oldQueryData, data];
              });
              return (
                <div className="flex flex-row items-center">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <div className="ml-2">
                    Webhook
                    <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">{`${data.url}`}</Badge>
                    has been created
                  </div>
                </div>
              )
              ;
            },
            error: (err: any) => err.message || 'Error'
        });
        handleOpenChange(false);
        posthog?.capture("webhook_created", {
            id_project: idProject,
            mode: config.DISTRIBUTION
        })
    }
  
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
            <Button 
                size="sm" 
                className="h-7 gap-1 w-[160px]" 
                onClick={ () => {
                    posthog?.capture("add_webhook_button_clicked", {
                        id_project: idProject,
                        mode: config.DISTRIBUTION
                    })
                }}
                >
                <PlusCircledIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Webhook
                </span>
            </Button>
            </DialogTrigger>
            <DialogContent className="sm:w-[450px]">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Create a webhook</CardTitle>
                        <CardDescription>
                        Set up your webhook endpoint to receive live events from Panora.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                            <FormField
                                control={form.control}
                                name="scopes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="scopes">Scopes</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col">
                                                <DataTableFacetedFilterWebhook title="Add" field={field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endpoint URL</FormLabel>
                                    <FormControl>
                                    <Input 
                                        placeholder="https://yourdomain/webhook_endpoint" {...field} 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                                    />
                                    </FormControl>
                                    <FormDescription>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                    <Input 
                                        placeholder="Give your endpoint a short, descriptive name." {...field} 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between space-x-2 items-end">
                        <Button type="submit" size="sm" className="h-7 gap-1">Create</Button>
                    </CardFooter>
                </form>
                </Form>
            </DialogContent>
        </Dialog>   
    )
}

export default AddWebhook;