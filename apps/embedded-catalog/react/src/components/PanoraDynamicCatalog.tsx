import {useState,useEffect} from 'react'
import {providersArray, ConnectorCategory, categoryFromSlug, Provider,CONNECTORS_METADATA, AuthStrategy} from '@panora/shared';
import useOAuth from '@/hooks/useOAuth';
import useProjectConnectors from '@/hooks/queries/useProjectConnectors';
import { Card } from './ui/card';
import { Button } from './ui/button2'
import { ArrowRightIcon } from '@radix-ui/react-icons';
import {ArrowLeftRight} from 'lucide-react'
import Modal from './Modal';
import config from '@/helpers/config';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import useCreateApiKeyConnection from '@/hooks/queries/useCreateApiKeyConnection';
import { LoadingSpinner } from './ui/loading-spinner';
import { Label } from './ui/label';


export interface DynamicCardProp {
  projectId: string;
  linkedUserId: string;
  category?: ConnectorCategory;
  optionalApiUrl?: string,
}
interface IApiKeyFormData {
  apikey: string,
  [key : string]: string
}


// const formSchema = z.object({
//   apiKey: z.string().min(2, {
//     message: "Api Key must be at least 2 characters.",
//   })
// })

const DynamicCatalog = ({projectId,linkedUserId, category, optionalApiUrl} : DynamicCardProp) => {

  // by default we render all integrations but if category is provided we filter by category

  const [selectedProvider, setSelectedProvider] = useState<{
    provider: string;
    category: string;
  }>({
    provider: '',
    category: ''
  });  
  
  const [loading, setLoading] = useState<boolean>(false);

  const [errorResponse,setErrorResponse] = useState<{
    errorPresent: boolean; errorMessage : string
  }>({errorPresent:false,errorMessage:''});
  const [startFlow, setStartFlow] = useState<boolean>(false);
  const [openSuccessDialog,setOpenSuccessDialog] = useState<boolean>(false);
  const [openApiKeyDialog,setOpenApiKeyDialog] = useState<boolean>(false);
  const [currentProviderLogoURL,setCurrentProviderLogoURL] = useState<string>('')
  const [currentProvider,setCurrentProvider] = useState<string>('')
  const returnUrlWithWindow = (typeof window !== 'undefined') 
    ? window.location.href
    : '';

  const {mutate : createApiKeyConnection} = useCreateApiKeyConnection();


  // const form = useForm<z.infer<typeof formSchema>>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     apiKey: "",
  //   },
  // })
  const {register,formState: {errors},handleSubmit,reset} = useForm<IApiKeyFormData>();

  
  const [data, setData] = useState<Provider[]>([]);

  const { open, isReady } = useOAuth({
    providerName: selectedProvider?.provider!,
    vertical: selectedProvider?.category! as ConnectorCategory,
    returnUrl: returnUrlWithWindow,
    projectId: projectId,
    linkedUserId: linkedUserId,
    optionalApiUrl: optionalApiUrl,
    onSuccess: () => { 
      console.log('OAuth successful');
      setOpenSuccessDialog(true);
    },
  });

  const {data: connectorsForProject} = useProjectConnectors(projectId,optionalApiUrl ? optionalApiUrl : config.API_URL!);

  const onWindowClose = () => {
    // setSelectedProvider({
    //   provider: '',
    //   category: ''
    // });
    setLoading(false)
    setStartFlow(false);
  }

  useEffect(() => {
    if (startFlow && isReady) {
      setErrorResponse({errorPresent:false,errorMessage:''});

      open(onWindowClose)
      .catch((error : Error) => {
        setLoading(false);
        setStartFlow(false);
        setErrorResponse({errorPresent:true,errorMessage:error.message})
      });
    } else if (startFlow && !isReady) {
      setLoading(false);
    }
  }, [startFlow, isReady]);

  useEffect(()=>{
    const PROVIDERS = !category ? providersArray() : providersArray(category);
    const getConnectorsToDisplay = () => {
      // First, check if the company selected custom connectors in the UI or not
      const unwanted_connectors = transformConnectorsStatus(connectorsForProject).filter(connector => connector.status === "false");
      // Filter out the providers present in the unwanted connectors array
      const filteredProviders = PROVIDERS.filter(provider => {
          return !unwanted_connectors.some( (unwanted) => 
            unwanted.category === provider.vertical && unwanted.connector_name === provider.name
          );
      });
      return filteredProviders;
    }

    if(connectorsForProject) {
      setData(getConnectorsToDisplay())
    }
  }, [connectorsForProject, category])

  const handleStartFlow = (walletName: string, category: string) => {
    setSelectedProvider({provider: walletName.toLowerCase(), category: category.toLowerCase()});
    const logoPath = CONNECTORS_METADATA[category.toLowerCase()][walletName.toLowerCase()].logoPath;
    setCurrentProviderLogoURL(logoPath)
    setCurrentProvider(walletName.toLowerCase())
    if(CONNECTORS_METADATA[category.toLowerCase()][walletName.toLowerCase()].authStrategy.strategy===AuthStrategy.api_key)
      {
        setOpenApiKeyDialog(true);
      }
    else
    {
      setLoading(true);
      setStartFlow(true);
    }
    
    
  }

  function transformConnectorsStatus(connectors : {[key: string]: boolean}): { connector_name: string;category: string; status: string }[] {
    return Object.entries(connectors).flatMap(([key, value]) => {
      const [category_slug, connector_name] = key.split('_').map((part: string) => part.trim());
      const category = categoryFromSlug(category_slug);
      if (category != null) {
          return [{
              connector_name: connector_name,
              category: category,
              status: value === null ? "true" : String(value)
          }];
      }
      return [];
    });
  }

  const onCloseApiKeyDialog = (dialogState : boolean) => {
    setOpenApiKeyDialog(dialogState);
    reset();
  }

  const onApiKeySubmit = (values: IApiKeyFormData) => {
    setErrorResponse({errorPresent:false,errorMessage:''});
    onCloseApiKeyDialog(false);
    setLoading(true);

    // Creating API Key Connection
    createApiKeyConnection({
      query : {
        linkedUserId: linkedUserId,
        projectId: projectId,
        providerName: selectedProvider?.provider!,
        vertical: selectedProvider?.category!
      },
      data: values,  
      api_url: optionalApiUrl ?? config.API_URL!
    },
    {
      onSuccess: () => {
        // setSelectedProvider({
        //   provider: '',
        //   category: ''
        // });   
        
        setLoading(false);
        setOpenSuccessDialog(true);
      },
      onError: (error) => {
        setErrorResponse({errorPresent:true,errorMessage: error.message});
        setLoading(false);
        // setSelectedProvider({
        //   provider: '',
        //   category: ''
        // });  
      }
    })
  }

  
  return (
      <div className="flex flex-col gap-2 pt-0">
        {data && data.map((item) => {
          return (
            <Card
            key={`${item.name}-${item.vertical}`} 
            className={`flex flex-col border w-1/2 items-start gap-2 rounded-lg p-3 text-left text-sm transition-all  
              ${ (item.name.toLowerCase()===selectedProvider?.provider && item.vertical?.toLowerCase()===selectedProvider?.category)  && errorResponse.errorPresent ? 'border-red-600' : 'hover:border-stone-400'}`}
            >
              <div className="flex w-full items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <img src={item.logoPath} className="w-8 h-8 rounded-lg" />
                    <div className="font-semibold">{`${item.name.substring(0, 1).toUpperCase()}${item.name.substring(1)}`}</div>
                  </div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {item.description!.substring(0, 300)}
                  </div>
                  <div className="line-clamp-2 mt-2 text-xs text-muted-foreground">
                  { (item.name.toLowerCase()===selectedProvider?.provider && item.vertical?.toLowerCase()===selectedProvider?.category) && loading ? (
                      <Button size="sm" className='h-7 gap-1' variant="default" disabled>
                      <LoadingSpinner/>
                      Connecting
                    </Button>
                    )
                    :
                    (   
                      <Button className='h-7 gap-1' size="sm" variant="expandIcon" Icon={ArrowRightIcon} iconPlacement="right" onClick={() => handleStartFlow(item.name, item.vertical!)} >
                      Connect
                    </Button>
                    )}
                  </div>

                  {item.name.toLowerCase()===selectedProvider?.provider && item.vertical?.toLowerCase()===selectedProvider?.category && errorResponse.errorPresent ? <p className='mt-2 text-xs text-red-700'>{errorResponse.errorMessage}</p> : (<></>)}
            
                </div>
                <div>
                </div>
              </div>
            </Card>
          )})
        }

        {/* Dialog for apikey input */}
        <Dialog open={openApiKeyDialog} onOpenChange={onCloseApiKeyDialog}>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter a API key</DialogTitle>
          </DialogHeader>
          {/* <Form {...form}> */}
            <form onSubmit={handleSubmit(onApiKeySubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className={errors.apikey ? 'text-destructive' : ''}>Enter your API key for {selectedProvider?.provider}</Label>
                <Input 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                        placeholder="Your api key"
                        {...register('apikey',{
                          required: 'Api Key must be at least 2 characters',
                          minLength: {
                            value:2,
                            message: 'Api Key must be at least 2 characters'
                          }
                        
                        })}
                  />
                  <div>{errors.apikey && (<p className='text-sm font-medium text-destructive'>{errors.apikey.message}</p>)}</div>
                  

                {/* </div> */}
                {selectedProvider.provider!=='' && selectedProvider.category!=='' && CONNECTORS_METADATA[selectedProvider.category][selectedProvider.provider].authStrategy.properties?.map((fieldName : string) => 
                (
                  <>
                  <Label className={errors[fieldName] ? 'text-destructive' : ''}>Enter your {fieldName} for {selectedProvider?.provider}</Label>
                  <Input
                        type='text'
                        placeholder={`Your ${fieldName}`}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                        {...register(fieldName,{
                          required: `${fieldName} must be at least 2 characters`,
                          minLength:{
                            value:2,
                            message: `${fieldName} must be at least 2 characters`,
                          }
                        })}
                  />
                  {errors[fieldName] && (<p className='text-sm font-medium text-destructive'>{errors[fieldName]?.message}</p>)}
                  </>
                ))}
              </div>
            </div>
          <DialogFooter>
            <Button variant='outline' type="reset" size="sm" className="h-7 gap-1" onClick={() => onCloseApiKeyDialog(false)}>Cancel</Button>
            <Button type='submit' size="sm" className="h-7 gap-1">
              Continue
            </Button>
          </DialogFooter>
            </form>
          {/* </Form> */}
          </DialogContent>
        </Dialog>


        {/* OAuth Successful Modal */}
        <Modal open={openSuccessDialog} setOpen={setOpenSuccessDialog} >
            <div className='h-[12rem] w-[20rem] justify-center flex p-1'>
                    <div className='flex flex-col gap-2 items-center'>
                    <div className='flex h-1/3 items-center justify-center gap-2'>
                    <img src={'https://i.postimg.cc/25G2FwWf/logo.png'} className={`${openSuccessDialog ? "opacity-100" : "opacity-0"} transition-all duration-500 delay-200`} width={60} height={60} />
                    <ArrowLeftRight size={25} className={`${openSuccessDialog ? "opacity-100" : "opacity-0"} transition-all duration-500 delay-200`} color='gray' />
            
                    <img className={`w-12 h-12 transition-all duration-700 delay-200 rounded-lg ml-3 ${openSuccessDialog ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} src={currentProviderLogoURL} alt={selectedProvider?.provider} />
                    
                    </div>

                    <div className={`text-white transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} font-semibold text-xl items-center`}>Connection Successful!</div>

                    <div className={`text-sm transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} text-gray-400 items-center align-middle text-center`}>The connection with {currentProvider} was successfully established. You can visit the Dashboard and verify the status.</div>

                    </div>
            </div>
            </Modal>
      </div>
  )
} 


export default DynamicCatalog