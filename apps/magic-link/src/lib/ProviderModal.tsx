import { useEffect, useState } from 'react';
import useOAuth from '@/hooks/useOAuth';
import { providersArray, categoryFromSlug, Provider,CONNECTORS_METADATA,AuthStrategy } from '@panora/shared/src';
import { categoriesVerticals } from '@panora/shared/src/categories';
import useUniqueMagicLink from '@/hooks/queries/useUniqueMagicLink';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import useProjectConnectors from '@/hooks/queries/useProjectConnectors';
import {ArrowLeftRight} from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import Modal from '@/components/Modal';
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


const formSchema = z.object({
  apiKey: z.string().min(2, {
    message: "Api Key must be at least 2 characters.",
  })
})

const ProviderModal = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProvider, setSelectedProvider] = useState<{
    provider: string;
    category: string;
  }>();
  const [startFlow, setStartFlow] = useState<boolean>(false);
  const [preStartFlow, setPreStartFlow] = useState<boolean>(false);
  const [openApiKeyDialog,setOpenApiKeyDialog] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string>("");
  const [data, setData] = useState<Provider[]>([]);
  const [errorResponse,setErrorResponse] = useState<{
    errorPresent: boolean; errorMessage : string
  }>({errorPresent:false,errorMessage:''})
  
  const [loading, setLoading] = useState<{
    status: boolean; provider: string
  }>({status: false, provider: ''});

  const [uniqueMagicLinkId, setUniqueMagicLinkId] = useState<string>('');
  const [openSuccessDialog,setOpenSuccessDialog] = useState<boolean>(false);
  const [currentProviderLogoURL,setCurrentProviderLogoURL] = useState<string>('')
  const [currentProvider,setCurrentProvider] = useState<string>('')

  const {mutate : createApiKeyConnection} = useCreateApiKeyConnection();
  const {data: magicLink} = useUniqueMagicLink(uniqueMagicLinkId); 
  const {data: connectorsForProject} = useProjectConnectors(projectId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  })

  useEffect(() => { 
    const queryParams = new URLSearchParams(window.location.search);
    const uniqueId = queryParams.get('uniqueLink');
    if (uniqueId) {
      setUniqueMagicLinkId(uniqueId);
    }
  }, []);

  useEffect(() => { 
    if (magicLink) {
      setProjectId(magicLink?.id_project);
    }
  }, [magicLink]);


  useEffect(()=>{
    const PROVIDERS = selectedCategory == "All" ? providersArray() : providersArray(selectedCategory);
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
  }, [connectorsForProject, selectedCategory])

  const { open, isReady } = useOAuth({
    providerName: selectedProvider?.provider!,
    vertical: selectedProvider?.category!,
    returnUrl: window.location.href,
    projectId: projectId,
    linkedUserId: magicLink?.id_linked_user as string,
    //optionalApiUrl: "https://prepared-wildcat-infinitely.ngrok-free.app", //CONNECTORS_METADATA[selectedProvider?.category!][selectedProvider?.provider!].options?.local_redirect_uri_in_https == true ? "https://prepared-wildcat-infinitely.ngrok-free.app": undefined,
    onSuccess: () => {
      console.log('OAuth successful');
      setOpenSuccessDialog(true);
    },
  });

  const onWindowClose = () => {
  
    setSelectedProvider({
      provider: '',
      category: ''
    });   
    
    setLoading({
        status: false,
        provider: ''
    })
    setStartFlow(false);
    setPreStartFlow(false);
  }

  useEffect(() => {
    if (startFlow && isReady) {
      setErrorResponse({errorPresent:false,errorMessage:''})
      
      open(onWindowClose)
      .catch((error : Error) => {
        setLoading({
          status: false,
          provider: ''
      });
        setErrorResponse({errorPresent:true,errorMessage:error.message})
        setStartFlow(false);
        setPreStartFlow(false);
      });
      
    } else if (startFlow && !isReady) {
      setLoading({
        status: false,
        provider: ''
      });
    }
  }, [startFlow, isReady]);

  
  
  const handleWalletClick = (walletName: string, category: string) => {
    setSelectedProvider({provider: walletName.toLowerCase(), category: category.toLowerCase()});
    const logoPath = CONNECTORS_METADATA[category.toLowerCase()][walletName.toLowerCase()].logoPath;
    setCurrentProviderLogoURL(logoPath);
    setCurrentProvider(walletName.toLowerCase())
    setPreStartFlow(true);
  };

  const handleStartFlow = () => {
    if(selectedProvider && CONNECTORS_METADATA[selectedProvider.category][selectedProvider.provider].authStrategy.strategy===AuthStrategy.api_key)
      {
        setOpenApiKeyDialog(true)
      }
    else
    {
      setLoading({status: true, provider: selectedProvider?.provider!});
      setStartFlow(true);
    }
    
  }

  const handleCategoryClick = (category: string) => {  
    setPreStartFlow(false);  
    setSelectedProvider({
      provider: '',
      category: ''
    });
    setSelectedCategory(category);
  };

  const CloseSuccessDialog = (close : boolean) => {
    if(!close)
      {
        setCurrentProvider('');
        setCurrentProviderLogoURL('')
        setOpenSuccessDialog(close);
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
              status: String(value)
          }];
      }
      return [];
    });
  }

  const onApiKeySubmit = (values: z.infer<typeof formSchema>) => {
    setOpenApiKeyDialog(false);
    setLoading({status: true, provider: selectedProvider?.provider!});

    // Creating API Key Connection
    createApiKeyConnection({
      query : {
        linkedUserId: magicLink?.id_linked_user as string,
        projectId: projectId,
        providerName: selectedProvider?.provider!,
        vertical: selectedProvider?.category!
      },
      data: {
        apikey: values.apiKey
      },  
    },
    {
      onSuccess: () => {
        setSelectedProvider({
          provider: '',
          category: ''
        });   
        
        setLoading({
            status: false,
            provider: ''
        });
        setOpenSuccessDialog(true);
      },
      onError: (error) => {
        setErrorResponse({errorPresent:true,errorMessage: error.message});
        setLoading({
          status: false,
          provider: ''
        });
        setSelectedProvider({
          provider: '',
          category: ''
        });  
      }
    })
  }


  return (
    <>
    <Card className='w-[50vw]'>
      <CardHeader>
        <CardTitle className='flex flex-row items-start mb-2'>Connect to your software</CardTitle>
        <Select onValueChange={(value) => handleCategoryClick(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
              <SelectItem key="All" value="All">
                All
                </SelectItem>
              <SelectSeparator/>
              {categoriesVerticals.map((vertical) => (
                <SelectItem key={vertical} value={vertical}>
                  {vertical}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className='max-h-[400px] overflow-y-auto'>
        <RadioGroup defaultValue="card" className="grid grid-cols-3 gap-4">
          {(data as Provider[]).map((provider) => (
            <div>
            <RadioGroupItem 
              key={`${provider.name}-${provider.vertical}`} 
              value={`${provider.name}-${provider.vertical}`} 
              id={`${provider.name}-${provider.vertical}`} 
              className="peer sr-only" 
              onClick={() => handleWalletClick(provider.name, provider.vertical!)}
            />
            <Label
              htmlFor={`${provider.name}-${provider.vertical}`}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <img className="w-14 h-14 rounded-lg mb-2" src={provider.logoPath} alt={provider.name} />
              <span>{provider.name.substring(0,1).toUpperCase().concat(provider.name.substring(1,provider.name.length))}</span>
            </Label>
          </div>
          ))}
        </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className='flex flex-col items-start'>
        
        {loading.status ? <Button className='w-full' disabled><LoadingSpinner className="w-4 mr-2"/>Loading</Button> : <Button className="w-full" onClick={handleStartFlow} disabled={!preStartFlow}>Continue</Button>}
        {errorResponse.errorPresent ? <p className='mt-2 text-red-700'>{errorResponse.errorMessage}</p> : (<></>)}

          {/* </div> */}
      </CardFooter>
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
                    <FormLabel>Enter your API key for {selectedProvider?.provider}</FormLabel>
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
    <Modal open={openSuccessDialog} setOpen={CloseSuccessDialog} >
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
    </>
  );
};

export default ProviderModal;
