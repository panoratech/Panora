import useOAuth from '@/hooks/useOAuth';
import { useEffect, useState } from 'react';
import { AuthStrategy, CONNECTORS_METADATA, ConnectorCategory } from '@panora/shared';
import { Button } from './ui/button2';
import { Card } from './ui/card';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import {ArrowLeftRight} from 'lucide-react'
import Modal from './Modal';
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import config from '@/helpers/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import useCreateApiKeyConnection from '@/hooks/queries/useCreateApiKeyConnection';
import { LoadingSpinner } from './ui/loading-spinner';


export interface ProviderCardProp {
  name: string;
  category: ConnectorCategory;
  projectId: string;
  linkedUserId: string;
  optionalApiUrl?: string,
}

const formSchema = z.object({
  apiKey: z.string().min(2, {
    message: "Api Key must be at least 2 characters.",
  })
})

const PanoraIntegrationCard = ({name, category, projectId, linkedUserId, optionalApiUrl}: ProviderCardProp) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [openSuccessDialog,setOpenSuccessDialog] = useState<boolean>(false);
    const [startFlow, setStartFlow] = useState<boolean>(false);
    const [openApiKeyDialog,setOpenApiKeyDialog] = useState<boolean>(false);
    const [errorResponse,setErrorResponse] = useState<{
      errorPresent: boolean; errorMessage : string
    }>({errorPresent:false,errorMessage:''});

    const {mutate : createApiKeyConnection} = useCreateApiKeyConnection();

    const returnUrlWithWindow = (typeof window !== 'undefined') 
    ? window.location.href 
    : '';

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        apiKey: "",
      },
    })


    const { open, isReady } = useOAuth({
      providerName: name.toLowerCase(),
      vertical: category.toLowerCase() as ConnectorCategory,
      returnUrl: returnUrlWithWindow,
      // returnUrl: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
      // returnUrl: returnUrl,
      projectId: projectId,
      linkedUserId: linkedUserId,
      optionalApiUrl: optionalApiUrl,
      onSuccess: () => {
        console.log('OAuth successful');
        setOpenSuccessDialog(true);
      },
    });
  
    const onWindowClose = () => {
      setLoading(false);
      setStartFlow(false);
      // return;
    }
  
    useEffect(() => {
      if (startFlow && isReady) {
        setErrorResponse({errorPresent:false,errorMessage:''})
        open(onWindowClose)
        .catch((error : Error) => {
          setLoading(false);
          setStartFlow(false);
          setErrorResponse({errorPresent:true,errorMessage:error.message})
        });
      } 
      else if (startFlow && !isReady) {
        setLoading(false);
      }
    }, [startFlow, isReady]);
    

    const handleStartFlow = () => {
      if(CONNECTORS_METADATA[category.toLowerCase()][name.toLowerCase()].authStrategy.strategy===AuthStrategy.api_key)
        {
          setOpenApiKeyDialog(true);
        }
      else
      {
        setLoading(true);
        setStartFlow(true);
      }
      
    }

    const onApiKeySubmit = (values: z.infer<typeof formSchema>) => {
      setErrorResponse({errorPresent:false,errorMessage:''});
      setOpenApiKeyDialog(false);
      setLoading(true);
  
      // Creating API Key Connection
      createApiKeyConnection({
        query : {
          linkedUserId: linkedUserId,
          projectId: projectId,
          providerName: name.toLowerCase(),
          vertical: category.toLowerCase()
        },
        data: {
          apikey: values.apiKey
        },
        api_url: optionalApiUrl ?? config.API_URL!
      },
      {
        onSuccess: () => {
          setLoading(false);
          setOpenSuccessDialog(true);
        },
        onError: (error) => {
          setErrorResponse({errorPresent:true,errorMessage: error.message});
          setLoading(false) 
        }
      })
    }

    const CONNECTOR = CONNECTORS_METADATA[category!.toLowerCase()][name.toLowerCase()]
  
    const img = CONNECTOR.logoPath;
      

    return (
      <div className="flex flex-col gap-2 pt-0">
            <Card
            key={`${name}-${category}`} 
            className={`flex flex-col border w-1/2 items-start gap-2 rounded-lg p-3 text-left text-sm transition-all  ${errorResponse.errorPresent ? 'border-red-600' : 'hover:border-stone-400'}`}
            >
              <div className="flex w-full items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <img src={img} className="w-8 h-8 rounded-lg" />
                    <div className="font-semibold">{`${name.substring(0, 1).toUpperCase()}${name.substring(1)}`}</div>
                  </div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {CONNECTOR.description!.substring(0, 300)}
                  </div>
                  <div className="line-clamp-2 mt-2 text-xs text-muted-foreground">
                    {loading ? (
                      <Button size="sm" className='h-7 gap-1' variant="default" disabled>
                      <LoadingSpinner/>
                      Connecting
                    </Button>
                    )
                    :
                    (   
                      <Button className='h-7 gap-1' size="sm" variant="expandIcon" Icon={ArrowRightIcon} iconPlacement="right" onClick={handleStartFlow} >
                      Connect
                    </Button>
                    )}
                    
                  </div>
                  

                  {errorResponse.errorPresent ? <p className='mt-2 text-xs text-red-700'>{errorResponse.errorMessage}</p> : (<></>)}

            
                </div>
                <div>
                </div>
              </div>
            </Card>

            {/* Dialog for apikey input */}
            <Dialog open={openApiKeyDialog} onOpenChange={setOpenApiKeyDialog}>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter a API key</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onApiKeySubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                  <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter your API key for {name}</FormLabel>
                            <FormControl>
                              <Input 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                              placeholder="Your awesome key name" {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                    />
                  </div>
                </div>
              <DialogFooter>
                <Button variant='outline' type="reset" size="sm" className="h-7 gap-1" onClick={() => setOpenApiKeyDialog(false)}>Cancel</Button>
                <Button type='submit' size="sm" className="h-7 gap-1">
                  Continue
                </Button>
              </DialogFooter>
                </form>
              </Form>
              </DialogContent>
            </Dialog>

            {/* OAuth Successful Modal */}
            <Modal open={openSuccessDialog} setOpen={setOpenSuccessDialog} >
            <div className='h-[12rem] w-[20rem] justify-center flex p-1'>
                    <div className='flex flex-col gap-2 items-center'>
                    <div className='flex h-1/3 items-center justify-center gap-2'>
                      <img src={'https://i.postimg.cc/25G2FwWf/logo.png'} className={`${openSuccessDialog ? "opacity-100" : "opacity-0"} transition-all duration-500 delay-200`} width={60} height={60} />
                      <ArrowLeftRight size={25} className={`${openSuccessDialog ? "opacity-100" : "opacity-0"} transition-all duration-500 delay-200`} color='gray' />
                      <img className={`w-12 h-12 transition-all duration-700 delay-200 rounded-lg ml-3 ${openSuccessDialog ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} src={img} alt={name} />
                    </div>
                      <div className={`text-white transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} font-semibold text-xl items-center`}>Connection Successful!</div>
                      <div className={`text-sm transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} text-gray-400 items-center align-middle text-center`}>The connection with {name} was successfully established. You can visit the Dashboard and verify the status.</div>
                    </div>
            </div>
            </Modal>
      </div>
    )
  };



export default PanoraIntegrationCard;