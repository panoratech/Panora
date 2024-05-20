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
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
import { DataTableFacetedFilterWebhook } from "../../shared/data-table-webhook-scopes"
import useCreateWebhook from "@/hooks/create/useCreateWebhook"


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

    const { mutate } = useCreateWebhook();

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
        mutate({
            url: values.url,
            description: values.description,
            id_project: idProject,
            scope: selectedScopes,
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