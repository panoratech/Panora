import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import ProviderModal from './lib/ProviderModal'
import {PanoraSDK} from "@panora/typescript-sdk";
function App() {
  const queryClient = new QueryClient();
  const sdk = new PanoraSDK({accessToken: 'YOUR_ACCESS_TOKEN'});
  (async () => {
    const result = await sdk.main
      .appControllerGetHello();
    console.log(result);
  })();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="card">
        <ProviderModal/>
      </div>
    </QueryClientProvider>
  )
}

export default App
