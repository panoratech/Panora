import React,{useState} from 'react'
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import useWebhookMutation from "@/hooks/mutations/useWebhookMutation"
import {ScrollArea} from '@/components/ui/scrollbar'
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
  } from "@/components/ui/command"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import {PasswordInput} from '@/components/ui/password-input'
import { scopes } from "@panora/shared"
import * as z from "zod"
import { cn } from "@/lib/utils"



const formSchema = z.object({
    provider_name: z.string({
        required_error: "Please select a provider.",
      }),
    auth_type : z.string({
        required_error: "Please select a authentication method",
    }),
    clientID : z.string({
        required_error: "Please Enter a Client ID",
    }),
    clientSecret : z.string({
        required_error: "Please Enter a Client Secret",
    }),
    scope : z.string({
        required_error: "Please Enter a scope",
    }),
    apiKey: z.string({
        required_error: "Please Enter a API Key",
    }),
    username: z.string({
        required_error: "Please Enter Username",
    }),
    secret: z.string({
        required_error: "Please Enter Secret",
    }),

})

const providers = [
    { 
        label: "Hubspot", value: "Hubspot",  
      logoPath: "https://assets-global.website-files.com/6421a177cdeeaf3c6791b745/64d61202dd99e63d40d446f6_hubspot%20logo.png",

    },
    { 
        label: "Attio", value: "Attio" ,
        logoPath: "https://asset.brandfetch.io/idZA7HYRWK/idYZS6Vp_r.png",

    },
    { 
        label: "Zoho", value: "Zoho" ,
      logoPath: 'https://assets-global.website-files.com/64f68d43d25e5962af5f82dd/64f68d43d25e5962af5f9812_64ad8bbe47c78358489b29fc_645e3ccf636a8d659f320e25_Group%25252012.png',

    },
    { 
        label: "Pipedrive", value: "Pipedrive" ,
      logoPath: 'https://asset.brandfetch.io/idZG_U1qqs/ideqSFbb2E.jpeg',

    },
    { 
        label: "Zendesk", value: "Zendesk" ,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',

    },
    {
        label:"Freshsales",value:"Freshsales",
        logoPath: 'https://play-lh.googleusercontent.com/Mwgb5c2sVHGHoDlthAYPnMGekEOzsvMR5zotxskrl0erKTW-xpZbuIXn7AEIqvrRHQ',

    }
    
  ] as const


  interface propType {
    data?:{
        provider_name:string,
        auth_type: string,
        activate: boolean,
        credentials: {
            clientID?:string,
            clientSecret?: string
            scope?: string,
            apiKey?: string,
            username?: string,
            secret?: string

        },
        action?: string,
        logoPath?: string,
    }

  }

const AddAuthCredentialsForm = (prop : propType) => {

    const [copied, setCopied] = useState(false);
    const [popoverOpen,setPopOverOpen] = useState(false);

    const handlePopOverClose = () => {
        setPopOverOpen(false);
    }

    const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText("localhost:3000/connections/oauth/callback")
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
        } catch (err) {
          console.error('Failed to copy: ', err);
        }
      };

      const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            provider_name: prop.data?.provider_name? prop.data?.provider_name : "",
            auth_type: prop.data?.auth_type? prop.data?.auth_type : "",
            clientID:prop.data?.credentials.clientID? prop.data?.credentials.clientID : "",
            clientSecret:prop.data?.credentials.clientSecret? prop.data?.credentials.clientSecret : "",
            scope:prop.data?.credentials.scope? prop.data?.credentials.scope : "",
            apiKey:prop.data?.credentials.apiKey? prop.data?.credentials.apiKey : "",
            username:prop.data?.credentials.username? prop.data?.credentials.username : "",
            secret:prop.data?.credentials.secret? prop.data?.credentials.secret : "",
             
        },
        
    })

    const Watch = form.watch()


    function onSubmit(values: z.infer<typeof formSchema>) {
        
    }




  return (
    <>
    <Form {...form}>

<form onSubmit={form.handleSubmit(onSubmit)}>
    <CardHeader>
        <CardTitle>Add 0Auth Credentials</CardTitle>
        <CardDescription>
        Add your provider's credentials for connection.
        </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-5">
        <div className="grid gap-4">
            {/* <div className="grip gap-4"> */}
            <FormField
            control={form.control}
            name="provider_name"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Provider</FormLabel>
                <Popover modal open={popoverOpen} onOpenChange={setPopOverOpen}>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value
                            ? providers.find(
                                (provider) => provider.value === field.value
                            )?.label
                            : "Select provider"}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent  side="bottom" className="p-0">
                    <Command  className="w-full">
                        <CommandInput
                        placeholder="Search provider..."
                        className="h-9 w-full"
                        
                        />
                        <CommandEmpty>No Provider found.</CommandEmpty>
                        <ScrollArea className="h-40">

                        <CommandGroup>
                        {providers.map((provider) => (
                            <CommandItem
                            value={provider.label}
                            key={provider.value}
                            onSelect={() => {
                                form.setValue("provider_name", provider.value)
                                handlePopOverClose();
                            }}
                            className={field.value===provider.value ? "bg-gray-200 w-full" : "w-full"}
                            
                            >
                            <div
                            // key={index}
                            className="flex items-center justify-between px-4 py-2 w-full cursor-pointer"
                            // onClick={() => handleWalletClick(provider.name)}
                            >
                            <div className="flex items-center w-full">
                                <img className="w-4 h-4 rounded-lg mr-3" src={provider.logoPath} alt={provider.label} />
                                <span>{provider.label}</span>
                                
                            </div>
                            {/* <CheckIcon
                                className={cn(
                                "h-4 w-4 flex ",
                                provider.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                                /> */}
                            
                            
                            </div>
                            
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                        </ScrollArea>
                            </Command>
                            </PopoverContent>
                        </Popover>

                        {/* <FormDescription>
                            This is the language that will be used in the dashboard.
                        </FormDescription> */}
                        <FormMessage />
                        </FormItem>
                    )}
                    />

            {/* </div> */}
        </div>
        <div className="grid gap-4">
            <FormField
            control={form.control}
            name="auth_type"
            render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Authentication Method</FormLabel>
                        <FormControl>
                            <Select 
                                onValueChange={field.onChange} defaultValue={field.value}
                            >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Authentication Method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0Auth2">0Auth2</SelectItem>
                                <SelectItem value="API">API</SelectItem>
                                <SelectItem value="Basic_Auth">Basic Auth</SelectItem>
                            </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
            )}
            />

        </div>

        {/* If Authentication Method is 0Auth2 */}

        {Watch.auth_type==="0Auth2" ? 
            <>
            <div className="flex flex-col">
                <FormField
                name="clientID"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Client ID</FormLabel>
                        <FormControl>
                        <PasswordInput id="clientID" value={field.value} onChange={field.onChange} placeholder="Enter Client ID" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
            </div>
            <div className="flex flex-col">
                <FormField
                name="clientSecret"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Client Secret</FormLabel>
                        <FormControl>
                        <PasswordInput id="clientID" value={field.value} onChange={field.onChange} placeholder="Enter Client Secret" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
            </div>
            <div className="flex flex-col">
                <FormField
                name="scope"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Scope</FormLabel>
                        <FormControl>
                        <Input id="scope" value={field.value} onChange={field.onChange} placeholder="Enter Scopes" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
            </div>
            <div className="flex flex-col">
                <FormLabel className="flex flex-col">Redirect URI</FormLabel>
                <div className="flex gap-2 mt-1">
                    {/* <p className=" text-gray-500">localhost:3000/connections/oauth/callback</p> */}
                    <Input value="localhost:3000/connections/oauth/callback" readOnly/>
                    <Button type="button" onClick={handleCopy}>
                        {copied ? 'Copied!' :
                        <>
                        <p className="mr-1">Copy</p>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    
                        </>}

                    </Button>


                    
                    

                </div>
                
            </div>
            </>   
            :
            <></>}

        {Watch.auth_type==="API" ? 
            <>
            <div className="flex flex-col">
                <FormField
                name="apiKey"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">API Key</FormLabel>
                        <FormControl>
                        <PasswordInput id="apiKey" value={field.value} onChange={field.onChange} placeholder="Enter API Key" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
            </div>
            </>   
            :
            <></>}

        {Watch.auth_type==="Basic_Auth" ? 
            <>
            <div className="flex flex-col">
                <FormField
                name="username"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Username</FormLabel>
                        <FormControl>
                        <PasswordInput id="username" value={field.value} onChange={field.onChange} placeholder="Enter API Key" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
            </div>
            <div className="flex flex-col">
                <FormField
                name="secret"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Secret</FormLabel>
                        <FormControl>
                        <PasswordInput id="secret" value={field.value} onChange={field.onChange} placeholder="Enter API Key" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
            </div>
            </>   
            :
            <></>}
        </CardContent>
        <CardFooter className="justify-between space-x-2">
            <Button type="submit">Submit</Button>
        </CardFooter>
</form>
</Form>
    </>
  )
}

export default AddAuthCredentialsForm