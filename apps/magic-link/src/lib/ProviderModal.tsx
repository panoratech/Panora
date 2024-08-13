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
import useCreateApiKeyConnection from '@/hooks/queries/useCreateApiKeyConnection';


interface IBasicAuthFormData {
  [key : string]: string
}

const domainFormats: { [key: string]: string } = {
  microsoftdynamicssales: 'YOURORGNAME.api.crm12.dynamics.com',
  bigcommerce: 'If your api domain is https://api.bigcommerce.com/stores/eubckcvkzg/v3 then store_hash is eubckcvkzg',
};

const ProviderModal = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProvider, setSelectedProvider] = useState<{
    provider: string;
    category: string;
  }>({provider:'',category:''});
  const [startFlow, setStartFlow] = useState<boolean>(false);
  const [preStartFlow, setPreStartFlow] = useState<boolean>(false);
  const [openBasicAuthDialog,setOpenBasicAuthDialog] = useState<boolean>(false);
  const [openDomainDialog, setOpenDomainDialog] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string>("");
  const [data, setData] = useState<Provider[]>([]);
  const [isProjectIdReady, setIsProjectIdReady] = useState(false);
  const [errorResponse,setErrorResponse] = useState<{
    errorPresent: boolean; errorMessage : string
  }>({errorPresent:false,errorMessage:''})
  const [endUserDomain, setEndUserDomain] = useState<string>('');
  const [loading, setLoading] = useState<{
    status: boolean; provider: string
  }>({status: false, provider: ''});

  const [uniqueMagicLinkId, setUniqueMagicLinkId] = useState<string | null>(null);
  const [openSuccessDialog,setOpenSuccessDialog] = useState<boolean>(false);
  const [currentProviderLogoURL,setCurrentProviderLogoURL] = useState<string>('')
  const [currentProvider,setCurrentProvider] = useState<string>('')
  const [redirectIngressUri, setRedirectIngressUri] = useState<{
    status: boolean;
    value: string | null;
  }>({
    status: false,
    value: null
  });
  const {mutate : createApiKeyConnection} = useCreateApiKeyConnection();
  const {data: magicLink} = useUniqueMagicLink(uniqueMagicLinkId); 
  const {data: connectorsForProject} = useProjectConnectors(isProjectIdReady ? projectId : null);
  const {register: register2, formState: {errors: errors2}, handleSubmit: handleSubmit2, reset: reset2} = useForm<IBasicAuthFormData>();

  useEffect(() => { 
    const queryParams = new URLSearchParams(window.location.search);
    const uniqueId = queryParams.get('uniqueLink');
    if (uniqueId) {
      setUniqueMagicLinkId(uniqueId);
    }
  }, []);

  useEffect(() => { 
    const queryParams = new URLSearchParams(window.location.search);
    const param = queryParams.get('redirectIngressUri');
    console.log("redirectIngressUri is "+ param)
    if (param !== null && param !== undefined) {
      setRedirectIngressUri({
        status: true,
        value: param
      });
    }
  }, []);

  useEffect(() => { 
    if (magicLink) {
      setProjectId(magicLink?.id_project);
      setIsProjectIdReady(true);
    }
  }, [magicLink]);


  useEffect(()=>{
    if (isProjectIdReady && connectorsForProject) { 
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
        setData(getConnectorsToDisplay())
    }
  }, [connectorsForProject, selectedCategory, isProjectIdReady])

  const { open, isReady } = useOAuth({
    providerName: selectedProvider?.provider!,
    vertical: selectedProvider?.category!,
    returnUrl: window.location.href,
    projectId: projectId,
    linkedUserId: magicLink?.id_linked_user as string,
    redirectIngressUri, 
    onSuccess: () => { 
      console.log('OAuth successful');
      setOpenSuccessDialog(true);
    },
    additionalParams: {
      end_user_domain: endUserDomain
    }
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
    const providerMetadata = CONNECTORS_METADATA[selectedProvider.category][selectedProvider.provider];
    if (providerMetadata.authStrategy.strategy === AuthStrategy.api_key || providerMetadata.authStrategy.strategy === AuthStrategy.basic) {
      setOpenBasicAuthDialog(true);
    } else if (providerMetadata?.options?.end_user_domain) {
      setOpenDomainDialog(true);
    } else {
      // OAUTH2 WITHOUT EXTRA PARAMS
      setLoading({ status: true, provider: selectedProvider?.provider! });
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

  function transformConnectorsStatus(connectors : {[key: string]: boolean | null}): { connector_name: string;category: string; status: string }[] {
    return Object.entries(connectors).flatMap(([key, value]) => {
      const [category_slug, connector_name] = key.split('_').map((part: string) => part.trim());
      const category = categoryFromSlug(category_slug);
      if (category != null) {
          return [{
              connector_name: connector_name,
              category: category,
              status: value == null ? "true" : String(value)
          }];
      }
      return [];
    });
  }

  const onCloseBasicAuthDialog = (dialogState : boolean) => {
    setOpenBasicAuthDialog(dialogState);
    reset2();
  }

  const onBasicAuthSubmit = (values: IBasicAuthFormData) => {
    onCloseBasicAuthDialog(false);
    setLoading({status: true, provider: selectedProvider?.provider!});
    setPreStartFlow(false);

    // Creating Basic Auth Connection
    createApiKeyConnection({
      query : {
        linkedUserId: magicLink?.id_linked_user as string,
        projectId: projectId,
        providerName: selectedProvider?.provider!,
        vertical: selectedProvider?.category!
      },
      data: values  
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
    });
  }

  const onCloseDomainDialog = (dialogState: boolean) => {
    setOpenDomainDialog(dialogState);
  }

  const onDomainSubmit = () => {
    setOpenDomainDialog(false);
    setLoading({ status: true, provider: selectedProvider?.provider! });
    setStartFlow(true);
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

    {/* Dialog for basic auth input */}
    <Dialog open={openBasicAuthDialog} onOpenChange={onCloseBasicAuthDialog}>
      <DialogContent>
      <DialogHeader>
        <DialogTitle>Enter your credentials</DialogTitle>
        {domainFormats[selectedProvider?.provider.toLowerCase()] && (
                    <span className="text-sm text-gray-500"> (e.g., {domainFormats[selectedProvider?.provider.toLowerCase()]})</span>
                  )}    
      </DialogHeader>
      {/* <Form {...form}> */}
        <form onSubmit={handleSubmit2(onBasicAuthSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            {selectedProvider.provider!=='' && selectedProvider.category!=='' && CONNECTORS_METADATA[selectedProvider.category][selectedProvider.provider].authStrategy.properties?.map((fieldName : string) => 
            (
              <>
              <Label className={errors2[fieldName] ? 'text-destructive' : ''}>
                Enter your {fieldName} for {selectedProvider?.provider.substring(0,1).toUpperCase()}{selectedProvider?.provider.substring(1)}
              </Label>
              <Input
                    type='text'
                    placeholder={`Your ${fieldName}`}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                    {...register2(fieldName,{
                      required: `${fieldName} must be at least 2 characters`,
                      minLength:{
                        value:2,
                        message: `${fieldName} must be at least 2 characters`,
                      }
                    })}
              />
              {errors2[fieldName] && (<p className='text-sm font-medium text-destructive'>{errors2[fieldName]?.message}</p>)}
              </>
            ))}
          </div>
        </div>
      <DialogFooter>
        <Button variant='outline' type="reset" size="sm" className="h-7 gap-1" onClick={() => onCloseBasicAuthDialog(false)}>Cancel</Button>
        <Button type='submit' size="sm" className="h-7 gap-1">
          Continue
        </Button>
      </DialogFooter>
        </form>
      {/* </Form> */}
      </DialogContent>
    </Dialog>

    {/* Dialog for end-user domain input */}
    <Dialog open={openDomainDialog} onOpenChange={onCloseDomainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Domain</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); onDomainSubmit(); }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className={errors2.end_user_domain ? 'text-destructive' : ''}>
                  Enter your domain for {`${selectedProvider?.provider.substring(0,1).toUpperCase()}${selectedProvider?.provider.substring(1)}`}
                  {domainFormats[selectedProvider?.provider.toLowerCase()] && (
                    <span className="text-sm text-gray-500"> (e.g., {domainFormats[selectedProvider?.provider.toLowerCase()]})</span>
                  )}                
                </Label>
                <Input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Your domain"
                  onChange={(e) => setEndUserDomain(e.target.value)}
                />
                <div>{errors2.end_user_domain && (<p className='text-sm font-medium text-destructive'>{errors2.end_user_domain.message}</p>)}</div>
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' type="reset" size="sm" className="h-7 gap-1" onClick={() => onCloseDomainDialog(false)}>Cancel</Button>
              <Button type='submit' size="sm" className="h-7 gap-1">
                Continue
              </Button>
            </DialogFooter>
          </form>
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
