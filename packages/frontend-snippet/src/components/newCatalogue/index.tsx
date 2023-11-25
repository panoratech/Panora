import React, { useEffect, useState } from 'react';
import useOAuth from '../../hooks/useOAuth';
import { TailSpin } from  'react-loader-spinner'
import { findProviderByName, providersArray } from '../../helpers/utils';

const categories = ['CRM', 'Ticketing', 'Marketing Automation','ATS', 'Accounting', 'File Storage', 'HR & Payroll'];


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
          <TailSpin
            height="40"
            width="40"
            color="white"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
           />
           </div>
        </div>
      </div>
    );
};

const WalletModal = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); // Default to the first category
  const [selectedProvider, setSelectedProvider] = useState('');
  const [loading, setLoading] = useState<{
    status: boolean; provider: string
  }>({status: false, provider: ''});

  const { open, isReady } = useOAuth({
    providerName: selectedProvider, // This will be set when a provider is clicked
    returnUrl: 'http://127.0.0.1:5173/', // Replace with the actual return URL
    projectId: '1', // Replace with the actual project ID
    linkedUserId: '1', // Replace with the actual user ID
    onSuccess: () => console.log('OAuth successful'),
  });

  const onWindowClose = () => {
    setSelectedProvider('');
    setLoading({
        status: false,
        provider: ''
    })
  }

  useEffect(() => {
    if (selectedProvider && isReady) {
        open(onWindowClose);
    }
    
  }, [selectedProvider, isReady, open]);
  
  const handleWalletClick = (walletName: string) => {
    console.log(`Wallet selected: ${walletName}`);
    setSelectedProvider(walletName.toLowerCase());
    setLoading({status: true, provider: walletName});
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };
  
  const PROVIDERS = providersArray(selectedCategory);


  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="w-[26rem] rounded-3xl bg-[#1d1d1d] text-white">
        {!loading.status && <div className="flex justify-between items-center border-b border-gray-600 p-4">
          <h3 className="text-lg font-medium">Select Integrations</h3>
          <button className="text-gray-400 hover:text-white transition duration-150">&times;</button>
        </div>}
        {!loading.status ? 
            <div className="p-4 max-h-[32rem] overflow-auto scrollbar-hide">
                <div className="flex mb-4 outline-none flex-wrap">
                    {categories.map((category, index) => (
                    <button
                        key={index}
                        className={`px-3 py-1 mb-2 mr-1 rounded-full text-xs font-medium transition duration-150 ${selectedCategory === category ? 'bg-indigo-600 hover:bg-indigo-500	' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        {category}
                    </button>
                    ))}
                </div>
                {(
                    <>
                    {PROVIDERS.map((provider, index) => (
                        <div
                        key={index}
                        className="flex items-center justify-between px-4 py-2 my-2 bg-neutral-900 hover:bg-neutral-800 border-black  hover:border-indigo-800 rounded-xl transition duration-150 cursor-pointer"
                        onClick={() => handleWalletClick(provider.name)}
                        >
                        <div className="flex items-center">
                        <img className="w-8 h-8 rounded-lg mr-3" src={provider.logoPath} alt={provider.name} />
                            <span>{provider.name}</span>
                        </div>
                        
                        </div>
                    ))}
                    
                    </>
                )}
            </div>
            :
            <LoadingOverlay providerName={loading.provider}/>
        }
      </div>
    </div>
  );
};

export default WalletModal;
