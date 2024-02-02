import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import ProviderModal from './lib/ProviderModal'
import { PanoraSDK } from "@panora/typescript-sdk";

function App() {
  const sdk = new PanoraSDK({accessToken: 'YOUR_ACCESS_TOKEN'});
  (async () => {
    const result = await sdk.main
      .appControllerGetHello();
    console.log(result);
  })();

  return (
      <div className="card">
        <ProviderModal/>
      </div>
  )
}

export default App
