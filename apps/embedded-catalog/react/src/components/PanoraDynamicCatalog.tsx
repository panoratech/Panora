import {useState,useEffect} from 'react'
import {providersArray, ConnectorCategory, categoryFromSlug, Provider} from '@panora/shared';
import useOAuth from '@/hooks/useOAuth';
import useProjectConnectors from '@/hooks/queries/useProjectConnectors';
import { Card } from './ui/card';
import { Button } from './ui/button2'
import { ArrowRightIcon } from '@radix-ui/react-icons';

export interface DynamicCardProp {
  projectId: string;
  returnUrl: string;
  linkedUserId: string;
  category?: ConnectorCategory;
  optionalApiUrl?: string,
}

const DynamicCatalog = ({projectId,returnUrl,linkedUserId, category, optionalApiUrl} : DynamicCardProp) => {

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
  
  const [data, setData] = useState<Provider[]>([]);

  const { open, isReady } = useOAuth({
    providerName: selectedProvider?.provider!,
    vertical: selectedProvider?.category! as ConnectorCategory,
    returnUrl: returnUrl,
    projectId: projectId,
    linkedUserId: linkedUserId,
    optionalApiUrl: optionalApiUrl,
    onSuccess: () => console.log('OAuth successful'),
  });

  const {data: connectorsForProject} = useProjectConnectors(projectId);

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
      </div>
  )
} 


export default DynamicCatalog