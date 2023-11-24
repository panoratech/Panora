import React, { useEffect, useState } from 'react';
import useOAuth from '../../hooks/useOAuth';

// Sample wallet data
const wallets = [
  { name: 'Pipedrive', icon: 'assets/crm/pipedrive_logo.jpeg', status: 'CRM', category: 'CRM' },
  { name: 'Zendesk', icon: 'assets/crm/zendesk_logo.png', status: 'CRM', category: 'CRM'  },
  { name: 'freshsales',icon: 'assets/crm/freshsales_logo.webp', status: null, category: 'CRM' },
  { name: 'Zoho',icon: 'assets/crm/zoho_logo.png', status: null, category: 'CRM'  },
  { name: 'Hubspot',icon: 'assets/crm/hubspot_logo.png', status: null, category: 'CRM'  },
  { name: 'Pennylane',icon: 'assets/accounting/pennylanelogo.png', status: null, category: 'Accounting'  },
  { name: 'Freshbooks',icon: 'assets/accounting/freshbooks.jpeg', status: null, category: 'Accounting'  },
  { name: 'Clearbooks',icon: 'assets/accounting/clearbooksLogo.png', status: null, category: 'Accounting'  },
  { name: 'FreeAgent',icon: 'assets/accounting/freeagent.png', status: null, category: 'Accounting'  },
  { name: 'Sage',icon: 'assets/accounting/sageLogo.png', status: null, category: 'Accounting'  },

];

const categories = ['CRM', 'Ticketing', 'Marketing Automation','ATS', 'Accounting', 'File Storage', 'HR & Payroll'];


const WalletModal = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); // Default to the first category
  const [selectedProvider, setSelectedProvider] = useState('');

  const { open, isReady } = useOAuth({
    providerName: selectedProvider, // This will be set when a provider is clicked
    returnUrl: 'http://127.0.0.1:5173/', // Replace with the actual return URL
    projectId: '1', // Replace with the actual project ID
    linkedUserId: '1', // Replace with the actual user ID
    onSuccess: () => console.log('OAuth successful'),
  });

  useEffect(() => {
    // Whenever the selectedProvider changes and is not null, and isReady is true, trigger the OAuth flow
    if (selectedProvider && isReady) {
        open(() => setSelectedProvider('')); // Reset provider when OAuth window is closed
      }
  }, [selectedProvider, isReady, open]);
  
  const handleWalletClick = (walletName) => {
    console.log(`Wallet selected: ${walletName}`);
    setSelectedProvider(walletName.toLowerCase()); // Convert the wallet name to the provider identifier
};

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // Assuming 'wallets' array contains a 'category' property for each wallet
    // Here you could also filter the list based on the selected category
  };
  
  const filteredWallets = wallets.filter(wallet => wallet.category === selectedCategory);


  return (
    <div className="fixed inset-0 bg-opacity-30 flex justify-center items-center">
      <div className="w-[26rem] rounded-3xl bg-neutral-950 text-white">

        <div className="flex justify-between items-center border-b border-gray-600 p-4">
          <h3 className="text-lg font-medium">Select Integrations</h3>
          <button className="text-gray-400 hover:text-white transition duration-150">&times;</button>
        </div>
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
              {filteredWallets.map((wallet, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 my-2 bg-neutral-900 hover:bg-neutral-800 border-black border-[1px] hover:border-indigo-800 rounded-xl transition duration-150 cursor-pointer"
                  onClick={() => handleWalletClick(wallet.name)}
                >
                  <div className="flex items-center">
                  <img className="w-8 h-8 rounded-lg mr-3" src={wallet.icon} alt={wallet.name} />
                    <span>{wallet.name}</span>
                  </div>
                  
                </div>
              ))}
              
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
