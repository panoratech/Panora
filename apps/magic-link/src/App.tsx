import './App.css'
import ProviderModal from './lib/ProviderModal'
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="">
        <ProviderModal/>
      </div>
    </ThemeProvider>
  )
}

export default App
