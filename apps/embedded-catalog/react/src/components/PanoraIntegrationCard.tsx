import useOAuth from '@/hooks/useOAuth';
import { useEffect, useState } from 'react';
import { CONNECTORS_METADATA, ConnectorCategory } from '@panora/shared';
import { Button } from './ui/button2';
import { Card } from './ui/card';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import {Unplug,X} from 'lucide-react'
import Modal from './Modal';

export interface ProviderCardProp {
  name: string;
  category: ConnectorCategory;
  projectId: string;
  returnUrl: string;
  linkedUserId: string;
  optionalApiUrl?: string,
}

const PanoraIntegrationCard = ({name, category, projectId, returnUrl, linkedUserId, optionalApiUrl}: ProviderCardProp) => {
    const [loading, setLoading] = useState(false);
    const [openSuccessDialog,setOpenSuccessDialog] = useState<boolean>(false);
    const [startFlow, setStartFlow] = useState(false);
    const returnUrlWithWindow = (typeof window !== 'undefined') 
    ? window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') 
    : '';


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

            {/* OAuth Successful Modal */}
            <Modal open={openSuccessDialog} setOpen={setOpenSuccessDialog} >
            <div className='h-[12rem] w-[20rem] justify-center flex p-1'>
                    <div className='flex flex-col gap-2 items-center'>
                    <div className='flex h-1/3 items-center justify-center gap-2'>
                    <Unplug className={`${openSuccessDialog ? "scale-100 opacity-100" : "scale-50 opacity-0"} transition-all duration-700`} size={60} color='#4CAF50' />
                    <X size={25} className={`${openSuccessDialog ? "opacity-100" : "opacity-0"} transition-all duration-500 delay-200`} color='gray' />
                    
                    <img className={`w-12 h-12 transition-all duration-700 delay-200 rounded-lg ml-3 ${openSuccessDialog ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} src={img} alt={name} />
                    
                    </div>

                    <div className={`text-white transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} font-semibold text-xl items-center`}>Connection Successful!</div>

                    <div className={`text-sm transition-all ease-in delay-200 ${openSuccessDialog ? "opacity-100 scale-100" : "opacity-0 scale-125"} text-gray-400 items-center align-middle text-center`}>The connection was successfully established. You can visit the Dashboard and verify the status.</div>

                    </div>
            </div>
            </Modal>
      </div>
    )
  };



export default PanoraIntegrationCard;