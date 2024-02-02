import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import ProviderModal from './lib/ProviderModal'
import { PanoraSDK } from "@panora/typescript-sdk";
import { PanoraIntegrationCard } from "@panora/integration-card-react";

function App() {
  const sdk = new PanoraSDK({accessToken: 'YOUR_ACCESS_TOKEN'});
  (async () => {
    const result = await sdk.main
      .appControllerGetHello();
    console.log(result);
  })();

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="card">
        <PanoraIntegrationCard name={"1"} projectId={"1"} returnUrl={"1"} linkedUserIdOrRemoteUserInfo={"1"} />
      </div>
    </QueryClientProvider>
  )
}

export default App
