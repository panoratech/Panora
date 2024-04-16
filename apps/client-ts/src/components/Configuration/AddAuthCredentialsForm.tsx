import React,{useEffect, useState} from 'react'
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import {ScrollArea} from '@/components/ui/scrollbar'
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import config from "@/lib/config"
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
import { ALL_PROVIDERS,getLogoURL,getProviderVertical,providerToType,AuthStrategy } from "@panora/shared"
import * as z from "zod"
import { cn } from "@/lib/utils"
import useProjectStore from "@/state/projectStore"
import useConnectionStrategyMutation from '@/hooks/mutations/useConnectionStrategy'
import { usePostHog } from 'posthog-js/react'
import useConnectionStrategyAuthCredentialsMutation from '@/hooks/mutations/useConnectionStrategyAuthCredentials'
import useUpdateConnectionStrategyMutation from '@/hooks/mutations/useUpdateConnectionStrategy'



const formSchema = z.object({
    provider_name: z.string().min(2, {
        message: "Provider should be selected.",
      }),
    auth_type : z.string().min(2, {
        message: "Authentication type should be selected.",
      }),
    client_id : z.string({
        required_error: "Please Enter a Client ID",
    }),
    client_secret : z.string({
        required_error: "Please Enter a Client Secret",
    }),
    scope : z.string({
        required_error: "Please Enter a scope",
    }),
    api_key: z.string({
        required_error: "Please Enter a API Key",
    }),
    username: z.string({
        required_error: "Please Enter Username",
    }),
    secret: z.string({
        required_error: "Please Enter Secret",
    }),

})

  interface propType {
    performUpdate: boolean,
    closeDialog?: () => void,
    data?:{
        provider_name: string,
        auth_type: string,
        status: boolean,
        id_cs: string,
        vertical: string,
        type: string,
        // client_id?:string,
        // client_secret?:string,
        // scope?:string,
        // api_key?:string,
        // username?:string,
        // secret?:string,


    }

  }

const AddAuthCredentialsForm = (prop : propType) => {

    const [copied, setCopied] = useState(false);
    const [popoverOpen,setPopOverOpen] = useState(false);
    // const [olddata,setOldData] = useState(prop.data)
    const {idProject} = useProjectStore()
    const {mutate : createCS} = useConnectionStrategyMutation();
    const {mutate :updateCS} = useUpdateConnectionStrategyMutation()
    const {mutateAsync : fetchCredentials,data : fetchedData} = useConnectionStrategyAuthCredentialsMutation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            provider_name: prop.data?.provider_name? `${prop.data?.provider_name.toLowerCase()}-${prop.data?.vertical.toUpperCase()}` : "",
            auth_type: prop.data?.auth_type? prop.data?.auth_type : "",
            client_id:"",
            client_secret:"",
            scope:"",
            api_key:"",
            username:"",
            secret:"",       
        },
        
    })



    const posthog = usePostHog()

    useEffect(() => {

        if(prop.performUpdate)
            {

                console.log(prop.data)

                fetchCredentials({
                    projectId:idProject,
                    type: prop.data?.type,
                    attributes: prop.data?.auth_type===AuthStrategy.oauth2 ? ["client_id","client_secret"]
                    : prop.data?.auth_type===AuthStrategy.api_key ? ["api_key"] : ["username","secret"]
                },
                {
                    onSuccess(data, variables, context) {

                        if(prop.data?.auth_type===AuthStrategy.oauth2)
                            {
                                form.setValue("client_id",data[0])
                                form.setValue("client_secret",data[1])
    
                            }
                            else if(prop.data?.auth_type===AuthStrategy.api_key)
                            {
                                form.setValue("api_key",data[0])
    
                            }
                            else
                            {
                                form.setValue("username",data[0])
                                form.setValue("secret",data[0])
    
                            }
                        
                    },
                }
            )
            }

},[])

    



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

      

    const Watch = form.watch()
    


    function onSubmit(values: z.infer<typeof formSchema>) {


        const {client_id,client_secret,scope,provider_name,api_key,auth_type,secret,username} = values


        switch(values.auth_type)
        {
            case AuthStrategy.oauth2:
                if(client_id==="" || client_secret==="" || scope==="")
                {
                    if(client_id==="")
                        {
                            form.setError("client_id",{"message":"Please Enter Client ID"})
                        }
                    if(client_secret==="")
                        {
                            form.setError("client_secret",{"message":"Please Enter Client Secret"})
                        }
                    if(scope==="")
                        {
                            form.setError("scope",{"message":"Please Enter the scope"})
                        }
                        break;
                }
                if(prop.performUpdate)
                {
                    updateCS({
                        id_cs:prop.data?.id_cs,
                        ToUpdateToggle: false,
                        status:prop.data?.status,
                        attributes:["client_id","client_secret"],
                        values:[client_id,client_secret]
                    })
                    posthog?.capture("Connection_strategy_0Auth2_updated", {
                        id_project: idProject,
                        mode: config.DISTRIBUTION
                      });
                }
                else
                {
                    createCS({
                        projectId:idProject,
                        type: providerToType(provider_name.split("-")[0],provider_name.split("-")[1],AuthStrategy.oauth2),
                        attributes:["client_id","client_secret"],
                        values:[client_id,client_secret]
                    });
                    posthog?.capture("Connection_strategy_0Auth2_created", {
                        id_project: idProject,
                        mode: config.DISTRIBUTION
                      });
                }
                
                form.reset();
                console.log(values)
                if(prop.closeDialog!=undefined)
                {
                    prop.closeDialog()
                }
                break;
            
            case AuthStrategy.api_key:
                if(values.api_key==="")
                {
                    form.setError("api_key",{"message":"Please Enter API Key"});
                    break;
                }
                if(prop.performUpdate)
                    {
                        updateCS({
                            id_cs:prop.data?.id_cs,
                            ToUpdateToggle: false,
                            status:prop.data?.status,
                            attributes:["api_key"],
                            values:[api_key]
                        })
                        posthog?.capture("Connection_strategy_API_KEY_updated", {
                            id_project: idProject,
                            mode: config.DISTRIBUTION
                          });
                    }
                    else
                    {
                        createCS({
                            projectId:idProject,
                            type: providerToType(provider_name.split("-")[0],provider_name.split("-")[1],AuthStrategy.api_key),
                            attributes:["api_key"],
                            values:[api_key]
                        });
                        posthog?.capture("Connection_strategy_API_KEY_created", {
                            id_project: idProject,
                            mode: config.DISTRIBUTION
                        });
                    }
                
                form.reset();
                console.log(values)
                if(prop.closeDialog!=undefined)
                {
                    prop.closeDialog()
                }
                break;

            case AuthStrategy.basic:
                if(values.username==="" || values.secret==="")
                    {
                        if(values.username==="")
                            {
                                form.setError("username",{"message":"Please Enter Username"})
                            }
                        if(values.secret==="")
                            {
                                form.setError("secret",{"message":"Please Enter Secret"})
                            }
                            break;

                    }
                    if(prop.performUpdate)
                        {
                            updateCS({
                                id_cs:prop.data?.id_cs,
                                ToUpdateToggle: false,
                                status:prop.data?.status,
                                attributes:["username","secret"],
                                values:[username,secret]
                            })
                            posthog?.capture("Connection_strategy_BASIC_AUTH_updated", {
                                id_project: idProject,
                                mode: config.DISTRIBUTION
                              });
                        }
                        else
                        {
                            createCS({
                                projectId:idProject,
                                type: providerToType(provider_name.split("-")[0],provider_name.split("-")[1],AuthStrategy.basic),
                                attributes:["username","secret"],
                                values:[username,secret]
                            });
                            posthog?.capture("Connection_strategy_BASIC_AUTH_created", {
                                id_project: idProject,
                                mode: config.DISTRIBUTION
                            });
                        }
                    
                    form.reset();
                    console.log(values)
                    if(prop.closeDialog!=undefined)
                    {
                        prop.closeDialog()
                    }
                break;
        }

        
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
            // disabled={prop.performUpdate}
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
                        disabled={prop.performUpdate}
                        className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value
                            ? field.value.charAt(0).toUpperCase()+field.value.slice(1)
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
                        <ScrollArea className="h-40 w-full">

                        <CommandGroup>
                        {ALL_PROVIDERS.map((provider) => (
                            <CommandItem
                            value={provider.value+'-'+provider.vertical}
                            key={provider.vertical+"-"+provider.value}
                            onSelect={() => {
                                form.setValue("provider_name", `${provider.value}-${provider.vertical}`)
                                form.clearErrors("provider_name")
                                handlePopOverClose();
                            }}
                            className={field.value===`${provider.value}-${provider.vertical}` ? "bg-gray-200 w-full" : "w-full"}
                            
                            >
                            <div
                            // key={index}
                            className="flex items-center justify-between px-4 py-2 w-full cursor-pointer"
                            // onClick={() => handleWalletClick(provider.name)}
                            >
                            <div className="flex items-center w-full">
                                <img className="w-4 h-4 rounded-lg mr-3" src={getLogoURL(provider.value)} alt={provider.value} />
                                <span className='w-full'>{provider.value.charAt(0).toUpperCase() + provider.value.slice(1)} - {provider.vertical}</span>
                                
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
                        <FormMessage />


                        {/* <FormDescription>
                            This is the language that will be used in the dashboard.
                        </FormDescription> */}
                        </FormItem>
                    )}
                    />

            {/* </div> */}
        </div>
        <div className="grid gap-4">
            <FormField
            control={form.control}
            name="auth_type"
            // disabled={prop.performUpdate}
            render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Authentication Method</FormLabel>
                        <FormControl>
                            <Select 
                            disabled={prop.performUpdate}
                                onValueChange={field.onChange} defaultValue={field.value}
                            >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Authentication Method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AuthStrategy.oauth2}>0Auth2</SelectItem>
                                <SelectItem value={AuthStrategy.api_key}>API</SelectItem>
                                <SelectItem value={AuthStrategy.basic}>Basic Auth</SelectItem>
                            </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
            )}
            />

        </div>

        {/* If Authentication Method is 0Auth2 */}

        {Watch.auth_type===AuthStrategy.oauth2 ? 
            <>
            <div className="flex flex-col">
                <FormField
                name="client_id"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Client ID</FormLabel>
                        <FormControl>
                        <PasswordInput {...field}  placeholder="Enter Client ID" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
            </div>
            <div className="flex flex-col">
                <FormField
                name="client_secret"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Client Secret</FormLabel>
                        <FormControl>
                        <PasswordInput {...field} placeholder="Enter Client Secret" />
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
                        <Input {...field} placeholder="Enter Scopes" />
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

        {Watch.auth_type===AuthStrategy.api_key ? 
            <>
            <div className="flex flex-col">
                <FormField
                name="api_key"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">API Key</FormLabel>
                        <FormControl>
                        <PasswordInput {...field} placeholder="Enter API Key" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
            </div>
            </>   
            :
            <></>}

        {Watch.auth_type===AuthStrategy.basic ? 
            <>
            <div className="flex flex-col">
                <FormField
                name="username"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="flex flex-col">Username</FormLabel>
                        <FormControl>
                        <PasswordInput {...field} placeholder="Enter API Key" />
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
                        <PasswordInput {...field} placeholder="Enter API Key" />
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