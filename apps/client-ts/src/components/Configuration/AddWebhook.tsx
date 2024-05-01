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
import useWebhookMutation from "@/hooks/mutations/useWebhookMutation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { scopes } from "@panora/shared/src/webhookScopes"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"


const formSchema = z.object({
    description: z.string().min(2, {
      message: "description must be at least 2 characters.",
    }),
    url: z.string().min(2, {
        message: "url must be at least 2 characters.",
    }),
    event: z.string(),
})

const AddWebhook = () => {
    const [open, setOpen] = useState(false);
    const handleClose = () => {
      setOpen(false);
    };
    const posthog = usePostHog()

    const {idProject} = useProjectStore();

    const { mutate } = useWebhookMutation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            url: "",
            event: scopes[0]
        },
    })
    
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        mutate({ 
            url: values.url,
            description: values.description,
            id_project: idProject,
            scope: [values.event],
        });
        handleClose();  
        posthog?.capture("webhook_created", {
            id_project: idProject,
            mode: config.DISTRIBUTION
        })
    }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-[160px] justify-between")}
            onClick={ () => {
                posthog?.capture("add_webhook_button_clicked", {
                    id_project: idProject,
                    mode: config.DISTRIBUTION
                })
            }}
          >
            <PlusCircledIcon className=" h-5 w-5" />
            Add Webhook
        </Button>
        </DialogTrigger>
        <DialogContent className="sm:w-[450px]">
        <Form {...form}>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Define your webhook</CardTitle>
                    <CardDescription>
                    React to specific events in your product.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <FormField
                                control={form.control}
                                name="event"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="event">Event</FormLabel>
                                        <FormControl>
                                            <Select 
                                                onValueChange={field.onChange} defaultValue={field.value}
                                            >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                scopes.map((scope) => {
                                                    return (
                                                    <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                                                    )
                                                })
                                                }
                                            </SelectContent>
                                            </Select>
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
                                <FormLabel>Destination URL</FormLabel>
                                <FormControl>
                                <Input 
                                    placeholder="https://localhost/my-endpoint/webhook" {...field} 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                                />
                                </FormControl>
                                <FormDescription>
                                This is the endpoint where the webhook will send requests to.
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
                                    placeholder="Please include a description of your endpoint." {...field} 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                                />
                                </FormControl>
                                <FormDescription>
                                This is the description of your webhook.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-between space-x-2">
                    <Button type="submit">Submit</Button>
                </CardFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>   
  )
}

export default AddWebhook;