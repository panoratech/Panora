import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import config from '@/helpers/config';
import useCreateApiKeyConnection from '@/hooks/queries/useCreateApiKeyConnection';
import useProjectConnectors from '@/hooks/queries/useProjectConnectors';
import useUniqueMagicLink from '@/hooks/queries/useUniqueMagicLink';
import useOAuth from '@/hooks/useOAuth';
import { AuthStrategy, categoryFromSlug, CONNECTORS_METADATA, Provider, providersArray } from '@panora/shared/src';
import { categoriesVerticals } from '@panora/shared/src/categories';
import { ArrowLeft, ArrowLeftRight, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";

interface IBasicAuthFormData {
  [key : string]: string
}

const domainFormats: { [key: string]: string } = {
  salesforce: 'If your Salesforce site URL is https://acme-dev.lightning.force.com, acme-dev is your domain',
  sharepoint: 'If the SharePoint site URL is https://joedoe.sharepoint.com/sites/acme-dev, joedoe is the tenant and acme-dev is the site name.',
  microsoftdynamicssales: 'If your Microsoft Dynamics URL is acme-dev.api.crm3.dynamics.com then acme-dev is the organization name.',
  bigcommerce: 'If your api domain is https://api.bigcommerce.com/stores/joehash123/v3 then store_hash is joehash123.',
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
  const [projectId, setProjectId] = useState<string>("");
  const [data, setData] = useState<Provider[]>([]);
  const [isProjectIdReady, setIsProjectIdReady] = useState(false);
  const [errorResponse,setErrorResponse] = useState<{
    errorPresent: boolean; errorMessage : string
  }>({errorPresent:false,errorMessage:''})
  const [loading, setLoading] = useState<{
    status: boolean; provider: string
  }>({status: false, provider: ''});
  const [additionalParams, setAdditionalParams] = useState<{[key: string]: string}>({});
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
  const [searchTerm, setSearchTerm] = useState('');

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
    additionalParams
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
    const providerMetadata = CONNECTORS_METADATA[selectedProvider.category][selectedProvider.provider];

    if (providerMetadata.authStrategy.strategy === AuthStrategy.oauth2) {
      setAdditionalParams(values);
      setStartFlow(true);
    }else{
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
    
  }

  const filteredProviders = data.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "All" || provider.vertical?.toLowerCase() === selectedCategory.toLowerCase())
  );

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider({ provider: provider.name.toLowerCase(), category: provider.vertical!.toLowerCase() });
    const logoPath = CONNECTORS_METADATA[provider.vertical!.toLowerCase()][provider.name.toLowerCase()].logoPath;
    setCurrentProviderLogoURL(logoPath);
    setCurrentProvider(provider.name.toLowerCase())

    const providerMetadata = CONNECTORS_METADATA[provider.vertical!.toLowerCase()][provider.name.toLowerCase()];
    if (providerMetadata.authStrategy.strategy === AuthStrategy.api_key || providerMetadata.authStrategy.strategy === AuthStrategy.basic || (providerMetadata.authStrategy.strategy === AuthStrategy.oauth2 && providerMetadata.authStrategy.properties)) {
      setOpenBasicAuthDialog(true);
    } else {
      setLoading({ status: true, provider: provider.name.toLowerCase() });
      setStartFlow(true);
    }
  };

  const formatProvider = (provider: string) => {
    return provider.substring(0,1).toUpperCase() + provider.substring(1)
  }
  const formatVertical = (vertical: string) => {
    switch(vertical){
      case "marketingautomation":
        return 'Marketing Automation';
      case "filestorage":
        return "File Storage";
      case "crm":
        return "CRM";
      default:
        return vertical.substring(0,1).toUpperCase() + vertical.substring(1)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Your Provider</h2>
          <X className="cursor-pointer" onClick={() => {/* Close modal logic */}} />
        </div>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] h-10 px-3 py-2 text-sm bg-white border border-input rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none !ring-0 !ring-offset-0">
              <SelectValue placeholder="Select vertical" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black border border-input shadow-md">
              {categoriesVerticals.map((vertical) => (
                <SelectItem 
                  key={vertical} 
                  value={vertical}
                  className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900"
                >
                  {formatVertical(vertical)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredProviders.map((provider) => (
            <div
            key={`${provider.name}-${provider.vertical}`}
            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded"
            onClick={() => handleProviderSelect(provider)}
            > 
            <div className="w-12 h-12 mr-3 rounded-md shadow-md overflow-hidden flex items-center justify-center bg-white">
              <img src={provider.logoPath} alt={provider.name} className="w-full h-full object-contain" />
            </div>
            <span>{formatProvider(provider.name)}</span>
          </div>
          ))}
        </div>
      </div>

      {/* Basic Auth Dialog */}
      <Dialog open={openBasicAuthDialog} onOpenChange={onCloseBasicAuthDialog}>
        <DialogContent className="bg-white text-black rounded-lg shadow-lg max-w-md w-full p-0 overflow-hidden">
          <div className="flex justify-between items-center p-4">
            <button onClick={() => onCloseBasicAuthDialog(false)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
          </div>
          
          <div className="flex flex-col items-center px-6 pb-6">
        
          {selectedProvider?.category && selectedProvider?.provider && CONNECTORS_METADATA[selectedProvider.category]?.[selectedProvider.provider] && (
            <>
              <div className="w-16 h-16 mr-3 mb-3 rounded-md shadow-md overflow-hidden flex items-center justify-center bg-white">
                <img 
                  src={CONNECTORS_METADATA[selectedProvider.category][selectedProvider.provider].logoPath} 
                  alt={selectedProvider.provider} 
                  className="w-full h-full object-contain" 
                />
              </div>
              <h2 className="text-xl font-semibold mb-6 text-center">
                Connect your {selectedProvider.provider.charAt(0).toUpperCase() + selectedProvider.provider.slice(1)} Account
              </h2>
            </>
          )}
            
            <form onSubmit={handleSubmit2(onBasicAuthSubmit)} className="w-full space-y-4">
              {selectedProvider.provider !== '' && selectedProvider.category !== '' && 
              CONNECTORS_METADATA[selectedProvider.category][selectedProvider.provider].authStrategy.properties?.map((fieldName: string) => (
                <div key={fieldName} className="space-y-1">
                  <Input
                    type={fieldName.toLowerCase().includes('password') ? 'password' : 'text'}
                    placeholder={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register2(fieldName, {
                      required: `${fieldName} is required`,
                      minLength: {
                        value: 2,
                        message: `${fieldName} must be at least 2 characters`,
                      }
                    })}
                  />
                  {errors2[fieldName] && <p className='text-sm font-medium text-red-500'>{errors2[fieldName]?.message}</p>}
                </div>
              ))}
              {domainFormats[selectedProvider.provider] && (
                <p className="text-sm text-gray-500 mt-1 font-bold">
                  {domainFormats[selectedProvider.provider]}
                </p>
              )}
              
              <Button 
                type='submit' 
                className="w-full p-2 rounded-md text-white font-semibold mt-4"
                style={{backgroundColor: selectedProvider.provider !== '' && selectedProvider.category !== '' ? CONNECTORS_METADATA[selectedProvider.category][selectedProvider.provider].primaryColor : "#00000000"}}
              >
                Connect
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Modal
        open={openSuccessDialog} 
        setOpen={CloseSuccessDialog}
        backgroundClass="bg-black/50"
      >
        <div className='bg-white text-black rounded-lg shadow-lg max-w-md w-full p-0  overflow-hidden'>
          <div className="flex justify-between items-center p-4">
          </div>
          
          <div className='flex flex-col items-center px-6 pb-6'>
            <div className='flex items-center justify-center gap-2 mb-4'>
              <img src={'https://i.postimg.cc/25G2FwWf/logo.png'} className={`w-12 h-12 ${openSuccessDialog ? "opacity-100" : "opacity-0"} transition-all duration-500 delay-200`} />
              <ArrowLeftRight size={25} className={`${openSuccessDialog ? "opacity-100" : "opacity-0"} transition-all duration-500 delay-200`} color='gray' />
              <div className="w-12 h-12 rounded-md shadow-md overflow-hidden flex items-center justify-center bg-white">
                <img className={`w-full h-full object-contain transition-all duration-700 delay-200 ${openSuccessDialog ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} src={currentProviderLogoURL} alt={currentProvider} />
              </div>
            </div>
            <h2 className={`text-xl font-semibold mb-2 text-center transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"}`}>
              Your data is being imported...
            </h2>
            <div className="flex items-center bg-white border-[1px] border-black text-black px-4 py-2 rounded-lg">
              <span className="text-md mr-3">✓</span>
              <span className="text-sm">You've successfully connected your account!</span>
            </div>
            <button 
              onClick={() => {
                CloseSuccessDialog(false)
                window.location.href = config.WEBAPP_URL;
              }}
              className="mt-4 px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-100 hover:text-black transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </Modal>

      {/* Loading state */}
      {loading.status && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center">
            <LoadingSpinner className="w-6 h-6 mr-2" />
            <span>Connecting to {loading.provider}...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorResponse.errorPresent && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{errorResponse.errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ProviderModal;
