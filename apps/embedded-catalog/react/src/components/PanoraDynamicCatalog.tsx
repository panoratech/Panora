import React,{useState,useEffect} from 'react'
import {findProviderByName, providersArray,categoriesVerticals,getLogoURL} from '@panora/shared';
import useOAuth from '@/hooks/useOAuth';
import config from '@/helpers/config';

interface DynamicCardProp {
  projectId: string;
  returnUrl: string;
  linkedUserId: string;
  optionalApiUrl?: string,
}


type DataState = { [key: string]: string[] };

const DynamicCatalog = ({projectId,returnUrl,linkedUserId,optionalApiUrl} : DynamicCardProp) => {

  const [selectedVertical, setSelectedVertical] = useState(''); // Default to the first category
  const [selectedProvider, setSelectedProvider] = useState('');
  const [data,setData] = useState<DataState>({});
  const [isLoading,setLoading] = useState(true);
  const [error,setError] = useState(false)

  const { open, isReady } = useOAuth({
    providerName: selectedProvider.toLowerCase(),
    vertical: selectedVertical.toLowerCase(),
    returnUrl: returnUrl,
    projectId: projectId,
    linkedUserId: linkedUserId,
    optionalApiUrl: optionalApiUrl,
    onSuccess: () => console.log('OAuth successful'),
  });

  useEffect(() => {

    const FetchData = async () => {
      try{
        const res = await fetch(`${optionalApiUrl? optionalApiUrl : config.API_URL!}/project-connectors/single?projectID=${projectId}`,{
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if(!res.ok)
        {
          throw new Error("Not found")
        }
      let data = await res.json();

      data = JSON.parse(data.selected_catalog)
      // console.log(data)
      setData(data);
      if(Object.keys(data).length >0)
        {
          setSelectedVertical(Object.keys(data)[0])
        }
      setError(false);
      setLoading(false);

      } 
      catch(error)
      {
        setError(true);
        setLoading(false);
        console.log(error)
      }
    }

    if(projectId===undefined || !projectId.match('[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'))
      {
        setError(true);
        setLoading(false);
        return;
      }
    

    FetchData();
  },[projectId])


  const handleWalletClick = (walletName: string) => {
    console.log(`Wallet selected: ${walletName}`);
    setSelectedProvider(walletName.toLowerCase());
  };

  const handleCategoryClick = (category: string) => {    
    setSelectedVertical(category);
  };

  const onConnect = () => {
    open(() => {
      console.log("Auth completed!")
    });
  }


  if(isLoading)
    {
      return (
        <>
        </>
      )
    }
    

  return (
    <>
    {error ? 
      (
        <div className='w-[21rem] h-[10rem]'>
        <div 
        className=" bg-red-500 text-white font-bold rounded-t px-4 py-2 shadow p-4"
        >
          Incorrect Attributes!
        </div>
        <div className='border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700'>
          <p>Please enter valid attributes for the Component.</p>
        </div>
        </div>
      )
      :
      (
        <>
        <div 
        className="w-[26rem] h-[26rem] p-2 bg-[#1d1d1d] border-[0.007em] border-gray-200 rounded-lg shadow dark:bg-[#1d1d1d] hover:border-gray-200  transition-colors duration-200"
        >
              <div className="flex items-center justify-center">
                {/* <img src={img} width={"30px"} className="mx-3 mb-4 w-12 h-12 rounded-xl"/> */}
                <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 text-white">Select your Integration</h5>
    
              </div> 

              <div className="p-4 h-[19rem]">
                {data && Object.keys(data).length==0 && (
                  <>
                    <h4 className='text-white'>Please select providers from dashboard to display in Catalog.</h4>
                  </>
                )}
                      <div className="flex mb-4 outline-none flex-wrap">
                        {data && Object.keys(data).length>0  && Object.keys(data).map((vertical) => (
                        <button
                            key={vertical}
                            className={`px-3 py-1 mb-2 mr-1 rounded-full text-white text-xs font-medium transition duration-150 ${selectedVertical === vertical ? 'bg-indigo-600 hover:bg-indigo-500	' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                            onClick={() => handleCategoryClick(vertical)}
                        >
                            {vertical}
                        </button>
                        ))}
                      </div>
                      {(
                      <>
                      <div className='h-2/3 no-scrollbar overflow-y-auto px-2'>
                        {selectedVertical!=='' && data && data[selectedVertical].map((provider)=> (
                            <div
                            key={provider}
                            className={`flex items-center justify-between px-4 py-2 my-2 ${selectedProvider === provider.toLowerCase() ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-neutral-900 hover:bg-neutral-800'} border-black  hover:border-indigo-800 rounded-xl transition duration-150 cursor-pointer`}
                            onClick={() => handleWalletClick(provider)}
                            >
                            <div className="flex items-center">
                              <img className="w-8 h-8 rounded-lg mr-3" src={getLogoURL(provider.toLowerCase())} alt={provider} />
                              <span className='text-white'>{provider.substring(0,1).toUpperCase().concat(provider.substring(1,provider.length))}</span>
                            </div>
                            
                            </div>
                        ))}
                      </div>
                      </>
                  )}
                  </div>
            
              <div className='flex m-2'>
              <button 
                onClick={() => onConnect()}
                disabled={selectedProvider==='' || selectedVertical===''}
                
                className={`text-white ${(selectedProvider==='' || selectedVertical==='') ? "opacity-50 cursor-not-allowed" : ""}  focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 me-2 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-gray-700 border-gray-700 w-full`}
                >
                  Connect
              </button>
              
              </div>
            
          </div> 
        </>
      )  
  }
    </>
  )
}

export default DynamicCatalog