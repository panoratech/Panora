import './App.css'
import { ThemeProvider } from '@/components/theme-provider'
import DashboardPage from './components/homepage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JobsPage from './components/events';
import ConnectionsPage from './components/connections';
import TaskPage from './components/events/EventsTable';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 3000,
            style: {
              background: '#0A0A0B',
              color: '#fff',
              border: "0.03rem solid white"
            },
          }}
        />
        <Router>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/tasks" element={<TaskPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
