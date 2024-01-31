import './App.css'
import ProviderCard from './lib'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
      <div>
        <h1 className="text-sm">
          <ProviderCard name={"front"} projectId={"1"} linkedUserIdOrRemoteUserInfo={"1"}  />
        </h1>
      </div>
      </QueryClientProvider>
    </>
  )
}

export default App
