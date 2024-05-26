import { useEffect, useState } from 'react';
import useOAuth from '@/hooks/useOAuth';
import { findProviderByName, providersArray, categoryFromSlug, Provider,CONNECTORS_METADATA } from '@panora/shared/src';
import { categoriesVerticals } from '@panora/shared/src/categories';
import useLinkedUser from '@/hooks/queries/useLinkedUser';
import useUniqueMagicLink from '@/hooks/queries/useUniqueMagicLink';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import useProjectConnectors from '@/hooks/queries/useProjectConnectors';
import {Unplug,X} from 'lucide-react'
import Modal from '@/components/Modal';


const LoadingOverlay = ({ providerName }: { providerName: string }) => {
    const provider = findProviderByName(providerName);
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <div className="text-center p-6 bg-[#1d1d1d] rounded-lg">
          <div className='icon-wrapper'>
            <img src={provider!.logoPath} alt={provider!.name} className="mx-auto mb-4 w-14 h-14 rounded-xl" />
          </div>
          
          <h4 className="text-lg font-bold mb-2">Continue in {provider!.name}</h4>
          <p className="text-gray-400 mb-4">Accepting oAuth access to Panora</p>
          <div className='flex justify-center items-center'>
            
           </div>
        </div>
      </div>
    );
};

const ProviderModal = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProvider, setSelectedProvider] = useState<{
    provider: string;
    category: string;
  }>();
  const [startFlow, setStartFlow] = useState(false);
  const [preStartFlow, setPreStartFlow] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [data, setData] = useState<Provider[]>([]);
  
  const [loading, setLoading] = useState<{
    status: boolean; provider: string
  }>({status: false, provider: ''});

  const [uniqueMagicLinkId, setUniqueMagicLinkId] = useState('');
  const [openSuccessDialog,setOpenSuccessDialog] = useState<boolean>(false);
  const [currentProviderLogoURL,setCurrentProviderLogoURL] = useState<string>('')

  const {data: magicLink} = useUniqueMagicLink(uniqueMagicLinkId); 
  const {data: connectorsForProject} = useProjectConnectors(projectId);

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
    returnUrl: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
    // returnUrl: "https://google.com", 
    // returnUrl: window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
    projectId: projectId,
    linkedUserId: magicLink?.id_linked_user as string,
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
      open(onWindowClose);
    } else if (startFlow && !isReady) {
      setLoading({
        status: false,
        provider: ''
      });
    }
  }, [startFlow, isReady, open]);

  
  
  const handleWalletClick = (walletName: string, category: string) => {
    setSelectedProvider({provider: walletName.toLowerCase(), category: category.toLowerCase()});
    const logoPath = CONNECTORS_METADATA[category.toLowerCase()][walletName.toLowerCase()].logoPath;
    setCurrentProviderLogoURL(logoPath)
    setPreStartFlow(true);
  };

  const handleStartFlow = () => {
    setLoading({status: true, provider: selectedProvider?.provider!});
    setStartFlow(true);
  }

  const handleCategoryClick = (category: string) => {  
    setPreStartFlow(false);  
    setSelectedProvider({
      provider: '',
      category: ''
    });
    setSelectedCategory(category);
  };

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
      <CardFooter>
        {loading.status ? <Button className='w-full flex flex-row items-center' disabled><LoadingSpinner className="w-4 mr-2"/>Loading</Button> : <Button className="w-full" onClick={handleStartFlow} disabled={!preStartFlow}>Continue</Button>}
      </CardFooter>
    </Card>

    {/* OAuth Successful Modal */}
    <Modal open={openSuccessDialog} setOpen={setOpenSuccessDialog} >
    <div className='h-[12rem] w-[20rem] justify-center flex p-1'>
            <div className='flex flex-col gap-2 items-center'>
            <div className='flex h-1/3 items-center justify-center gap-2'>
            <Unplug className={`${openSuccessDialog ? "scale-100 opacity-100" : "scale-50 opacity-0"} transition-all duration-700`} size={60} color='#4CAF50' />
            <X size={25} className={`${openSuccessDialog ? "opacity-100" : "opacity-0"} transition-all duration-500 delay-200`} color='gray' />
            
            <img className={`w-12 h-12 transition-all duration-700 delay-200 rounded-lg ml-3 ${openSuccessDialog ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} src={currentProviderLogoURL} alt={selectedProvider?.provider} />
            
            </div>

            <div className={`text-white transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} font-semibold text-xl items-center`}>Connected !</div>

            <div className={`text-sm transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} text-gray-400 items-center align-middle text-center`}>The connection was successfully established. You can visit the Dashboard and verify the status.</div>

            </div>
    </div>
    </Modal>
    </>
  );
};

export default ProviderModal;
