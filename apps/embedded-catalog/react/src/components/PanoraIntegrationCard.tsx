import useOAuth from '@/hooks/useOAuth';
import { useEffect, useState } from 'react';
import { CONNECTORS_METADATA, ConnectorCategory } from '@panora/shared';
import { Button } from './ui/button2';
import { Card } from './ui/card';
import { ArrowRightIcon } from '@radix-ui/react-icons';

export interface ProviderCardProp {
  name: string;
  category: ConnectorCategory;
  projectId: string;
  returnUrl: string;
  linkedUserId: string;
  optionalApiUrl?: string,
}

const PanoraIntegrationCard = ({name, category, projectId, returnUrl, linkedUserId, optionalApiUrl}: ProviderCardProp) => {
    const [loading, setLoading] = useState(false)
    const [startFlow, setStartFlow] = useState(false);

    const { open, isReady } = useOAuth({
      providerName: name.toLowerCase(),
      vertical: category.toLowerCase() as ConnectorCategory,
      returnUrl: returnUrl,
      projectId: projectId,
      linkedUserId: linkedUserId,
      optionalApiUrl: optionalApiUrl,
      onSuccess: () => console.log('OAuth successful'),
    });
  
    const onWindowClose = () => {
      setLoading(false);
      return;
    }
  
    useEffect(() => {
      if (startFlow && isReady) {
        open(onWindowClose);
      } else if (startFlow && !isReady) {
        setLoading(false);
      }
    }, [startFlow, isReady, open]);
    

    const handleStartFlow = () => {
      setLoading(true);
      setStartFlow(true);
    }

    const CONNECTOR = CONNECTORS_METADATA[category!.toLowerCase()][name.toLowerCase()]
  
    const img = CONNECTOR.logoPath;
      

    return (
      <div className="flex flex-col gap-2 pt-0">
            <Card
            key={`${name}-${category}`} 
            className= "flex flex-col border w-1/2 items-start gap-2 rounded-lg p-3 text-left text-sm transition-all hover:border-stone-100"
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
                    <Button className='h-7 gap-1' size="sm" variant="expandIcon" Icon={ArrowRightIcon} iconPlacement="right" onClick={handleStartFlow} >
                      Connect
                    </Button>
                  </div>
            
                </div>
                <div>
                </div>
              </div>
            </Card>
      </div>
    )
  };



export default PanoraIntegrationCard;