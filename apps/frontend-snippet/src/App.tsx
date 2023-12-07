import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import ProviderModal from './lib/ProviderModal'

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>

      <div className="card">
        <ProviderModal/>
      </div>
    </QueryClientProvider>
  )
}

export default App
