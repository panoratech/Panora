import { useState } from 'react';
import './App.css'
import useOAuth from './hooks/useOAuth';
import ProviderModal from './lib/ProviderModal';
import { CRM_PROVIDERS } from './helpers/utils';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [providerId, setProviderId] = useState("");
  const [returnUrl, setReturnUrl] = useState("http://127.0.0.1:5173/");
  const [projectId, setPojectId] = useState("1");
  const [userId, setUserId] = useState("1");

  const { open, isReady } = useOAuth({
    //clientId: CLIENT_ID!, not needed as we manage it for now
    providerName: providerId,
    returnUrl: returnUrl, //CLIENT WOULD PROVIDER IT
    projectId: projectId, 
    linkedUserId: userId, //CLIENT WOULD PROVIDER IT
    onSuccess: () => console.log('OAuth successful')
  });
  const handleProviderSelection = (providerName: string) => {
    console.log(`Selected provider: ${providerName}`);
    switch (providerName) {
      case CRM_PROVIDERS.HUBSPOT:
        setProviderId("hubspot");
        //TODO: handle scopes 
        break;

      case CRM_PROVIDERS.PIPEDRIVE:
        setProviderId("pipedrive");
        //TODO: handle scopes 
        break;

      case CRM_PROVIDERS.ZENDESK:
        setProviderId("zendesk");
        //TODO: handle scopes 
        break;

      case CRM_PROVIDERS.ZOHO:
        setProviderId("zoho");
        //TODO: handle scopes 
        break;

      case CRM_PROVIDERS.FRESHSALES:
        setProviderId("freshsales");
        //TODO: handle scopes 
        break;

      default:
        break;

    }
    open();
    setIsModalOpen(false);
  };
  return (
    <>
      <h1 className='text-5xl font-bold'>Integrations Flow</h1>
      <div className="card">
        <button disabled={!isReady} onClick={() => setIsModalOpen(true)}>
          Start OAuth Flow
        </button>
        <ProviderModal
          isOpen={isModalOpen}
          onSelectProvider={handleProviderSelection}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </>
  )
}

export default App
