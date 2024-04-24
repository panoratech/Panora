import "./global.css";
import useOAuth from '@/hooks/useOAuth';
import { useEffect, useState } from 'react';
import { getDescription, providersConfig } from '@panora/shared';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProviderCardProp {
  name: string;
  vertical: string;
  projectId: string;
  returnUrl: string;
  linkedUserId: string;
  optionalApiUrl?: string,
}
const PanoraIntegrationCard = ({name, vertical, projectId, returnUrl, linkedUserId, optionalApiUrl}: ProviderCardProp) => {
  const [providerClicked, setProviderClicked] = useState(false);
  const [loading, setLoading] = useState(false)

  //const vertical = findProviderVertical(name.toLowerCase())
  //if(!projectId || !linkedUserId) return;

  const { open, isReady } = useOAuth({
    providerName: name.toLowerCase(),
    vertical: vertical.toLowerCase(),
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
    if (loading && providerClicked && isReady) {
      open(onWindowClose);
      return;
    }
  }, [providerClicked, isReady, open, loading]);
  

  const handleClick = () => {    
    setLoading(true);
    setProviderClicked(true);
    return;
  }; 

  const img = providersConfig[vertical!.toLowerCase()][name.toLowerCase()].logoPath;
    
  return (
      <div 
      className="max-w-sm p-6 bg-white border-[0.007em] border-gray-200 rounded-lg shadow dark:bg-zinc-800 hover:border-gray-200  transition-colors duration-200"
      >
          <div className=" flex items-center justify-center">
            <img src={img} width={"30px"} className="mx-3 mb-4 w-12 h-12 rounded-xl"/>
            <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Integrate with {name}</h5>

          </div>
          
          <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">{getDescription(name.toLowerCase())}</p>
          {!loading ? 
          <a 
            href="#" className="inline-flex items-center text-indigo-600 hover:underline"
            onClick={handleClick}
          >
              Connect in one click
              <svg className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"/>
              </svg>
          </a>

        : 
         <>
          <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">Continue in {name} </p>
          <div className='flex justify-center items-center'>
          
          </div>
          </>
        }
      </div> 
  )
};

const PanoraProviderCard = ({name, vertical, projectId, returnUrl, linkedUserId, optionalApiUrl}: ProviderCardProp) => {
    const queryClient = new QueryClient();
    return (
      <QueryClientProvider client={queryClient}>
          <PanoraIntegrationCard name={name} vertical={vertical} projectId={projectId} returnUrl={returnUrl} linkedUserId={linkedUserId} optionalApiUrl={optionalApiUrl}  />
      </QueryClientProvider>
    )
}
  
export default PanoraProviderCard;
