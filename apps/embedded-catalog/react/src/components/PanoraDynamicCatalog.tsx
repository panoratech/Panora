import React,{useState,useEffect} from 'react'
import {findProviderByName, providersArray,categoriesVerticals,getLogoURL} from '@panora/shared';
import useOAuth from '@/hooks/useOAuth';

interface DynamicCardProp {
  projectId: string;
  returnUrl: string;
  linkedUserId: string;
  optionalApiUrl?: string,
}


type DataState = { [key: string]: string[] };

const MainCatalog = ({projectId,returnUrl,linkedUserId,optionalApiUrl} : DynamicCardProp) => {

  const [selectedVertical, setselectedVertical] = useState(''); // Default to the first category
  const [selectedProvider, setSelectedProvider] = useState('');
  const [data,setData] = useState<DataState>({})
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
        const res = await fetch(`http://localhost:3000/catalog-options/single?projectID=${projectId}`,{
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if(!res.ok)
        {
          throw new Error("Not found")
        }
      const data = await res.json();
      console.log(data)
      setData(JSON.parse(data.selected_catalog))
      setError(false)
      } catch(error)
      {
        setError(true)
        console.log(error)
      }
    }

    if(projectId===undefined || !projectId.match('[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'))
      {
        setError(true)
        return;
      }
    

    FetchData();
  },[projectId])


  const handleWalletClick = (walletName: string) => {
    console.log(`Wallet selected: ${walletName}`);
    setSelectedProvider(walletName.toLowerCase());
  };

  const handleCategoryClick = (category: string) => {    
    setselectedVertical(category);
  };

  const onConnect = () => {
    open(() => {
      console.log("Auth completed!")
    });
  }
    

  return (
    <div className='h-screen flex items-center justify-center'>
      <div className="w-[26rem] rounded-3xl bg-[#1d1d1d] text-white">
            {error ? (
              <>
              <div>Error</div>
              </>
            )
            :
            (
              <>
              <div className=" flex items-center justify-center">
                  {/* <img src={img} width={"30px"} className="mx-3 mb-4 w-12 h-12 rounded-xl"/> */}
                {/* <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Select your Integration</h5> */}
                </div>
                <div className="p-4 max-h-[32rem] overflow-auto scrollbar-hide">
                        <div className="flex mb-4 outline-none flex-wrap">
                            {data && Object.keys(data).map((vertical) => (
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
                            {selectedVertical!=='' && data && data[selectedVertical].map((provider) => (

                                // <button
                                // key={provider}
                                // className={`px-3 py-1 mb-2 mr-1 rounded-full text-white text-xs font-medium transition duration-150 ${selectedProvider === provider ? 'bg-indigo-600 hover:bg-indigo-500	' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                                // onClick={() => handleWalletClick(provider)}
                                // >
                                // {provider.substring(0,1).toUpperCase().concat(provider.substring(1,provider.length))}
                                // </button>

                                <div
                                key={provider}
                                className={`flex items-center justify-between px-4 py-2 my-2 ${selectedProvider === provider.toLowerCase() ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-neutral-900 hover:bg-neutral-800'} border-black  hover:border-indigo-800 rounded-xl transition duration-150 cursor-pointer`}
                                onClick={() => handleWalletClick(provider)}
                                >
                                <div className="flex items-center">
                                  <img className="w-8 h-8 rounded-lg mr-3" src={getLogoURL(provider)} alt={provider} />
                                  <span>{provider.substring(0,1).toUpperCase().concat(provider.substring(1,provider.length))}</span>
                                </div>
                                
                                </div>
                            ))}
                            
                            </>
                        )}
                    </div>

                <div className='flex justify-center items-center m-2'>
                <button 
                onClick={() => onConnect()}
                disabled={selectedProvider==='' || selectedVertical===''}
                className={`text-white ${(selectedProvider==='' || selectedVertical==='') ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-800"}  bg-neutral-700  focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700`}>
                  Click to Connect
                  </button> 
                </div>
              </>
            )
          }
        </div> 
    </div>
  )
}

export default MainCatalog