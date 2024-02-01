import './App.css'
import { PanoraIntegrationCard } from './components/PanoraIntegrationCard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
      <div>
        <h1 className="text-sm">
          <PanoraIntegrationCard name={"Zoho"} projectId={"1"} returnUrl={""} linkedUserIdOrRemoteUserInfo={"1"}  />
        </h1>
      </div>
      </QueryClientProvider>
    </>
  )
}

export default App
