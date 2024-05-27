import {useState,useEffect} from 'react'
import {providersArray, ConnectorCategory, categoryFromSlug, Provider,CONNECTORS_METADATA} from '@panora/shared';
import useOAuth from '@/hooks/useOAuth';
import useProjectConnectors from '@/hooks/queries/useProjectConnectors';
import { Card } from './ui/card';
import { Button } from './ui/button2'
import { ArrowRightIcon } from '@radix-ui/react-icons';
import {Unplug,X} from 'lucide-react'
import Modal from './Modal';
import config from '@/helpers/config';

export interface DynamicCardProp {
  projectId: string;
  linkedUserId: string;
  category?: ConnectorCategory;
  optionalApiUrl?: string,
}

const DynamicCatalog = ({projectId,linkedUserId, category, optionalApiUrl} : DynamicCardProp) => {

  // by default we render all integrations but if category is provided we filter by category

  const [selectedProvider, setSelectedProvider] = useState<{
    provider: string;
    category: string;
  }>();  
  
  const [loading, setLoading] = useState<{
    status: boolean; provider: string
  }>({status: false, provider: ''});

  const [error,setError] = useState(false);
  const [startFlow, setStartFlow] = useState(false);
  const [openSuccessDialog,setOpenSuccessDialog] = useState<boolean>(false);
  const [currentProviderLogoURL,setCurrentProviderLogoURL] = useState<string>('')
  const returnUrlWithWindow = (typeof window !== 'undefined') 
    ? window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') 
    : '';

  
  const [data, setData] = useState<Provider[]>([]);

  const { open, isReady } = useOAuth({
    providerName: selectedProvider?.provider!,
    vertical: selectedProvider?.category! as ConnectorCategory,
    returnUrl: returnUrlWithWindow,
    // returnUrl: returnUrl,
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
    setSelectedProvider({
      provider: '',
      category: ''
    });
    setLoading({
        status: false,
        provider: ''
    })
    setStartFlow(false);
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
    setLoading({status: true, provider: selectedProvider?.provider!});
    setStartFlow(true);
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

  
  return (
      <div className="flex flex-col gap-2 pt-0">
        {data && data.map((item) => {
          return (
            <Card
            key={`${item.name}-${item.vertical}`} 
            className= "flex flex-col border w-1/2 items-start gap-2 rounded-lg p-3 text-left text-sm transition-all hover:border-stone-100"
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
                    <Button className='h-7 gap-1' size="sm" variant="expandIcon" Icon={ArrowRightIcon} iconPlacement="right" onClick={() => handleStartFlow(item.name, item.vertical!)} >
                      Connect
                    </Button>
                  </div>
            
                </div>
                <div>
                </div>
              </div>
            </Card>
          )})
        }


        {/* OAuth Successful Modal */}
        <Modal open={openSuccessDialog} setOpen={setOpenSuccessDialog} >
            <div className='h-[12rem] w-[20rem] justify-center flex p-1'>
                    <div className='flex flex-col gap-2 items-center'>
                    <div className='flex h-1/3 items-center justify-center gap-2'>
                    <Unplug className={`${openSuccessDialog ? "scale-100 opacity-100" : "scale-50 opacity-0"} transition-all duration-700`} size={60} color='#4CAF50' />
                    <X size={25} className={`${openSuccessDialog ? "opacity-100" : "opacity-0"} transition-all duration-500 delay-200`} color='gray' />
                    
                    <img className={`w-12 h-12 transition-all duration-700 delay-200 rounded-lg ml-3 ${openSuccessDialog ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} src={currentProviderLogoURL} alt={selectedProvider?.provider} />
                    
                    </div>

                    <div className={`text-white transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} font-semibold text-xl items-center`}>Connection Successful!</div>

                    <div className={`text-sm transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} text-gray-400 items-center align-middle text-center`}>The connection was successfully established. You can visit the Dashboard and verify the status.</div>

                    </div>
            </div>
            </Modal>
      </div>
  )
} 


export default DynamicCatalog