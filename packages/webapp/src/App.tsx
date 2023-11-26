import './App.css'
import { ThemeProvider } from '@/components/theme-provider'
import DashboardPage from './components/dashboard'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div>
        <DashboardPage/>
      </div>
    </ThemeProvider>
  )
}

export default App
