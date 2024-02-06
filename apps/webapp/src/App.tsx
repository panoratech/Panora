import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LogsPage from './components/events';
import ConnectionsPage from './components/connections';
import TaskPage from './components/events/EventsTable';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { RootLayout } from './components/root-layout';
import ConfigurationPage from './components/configuration';
import ApiKeysPage from './components/api-keys';
import DashboardPage from './components/dashboard';
import useProfileStore from './state/profileStore';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function App() {
  const {profile} = useProfileStore();
  const posthog = usePostHog()

  useEffect(() => {
    if(profile){
      posthog?.identify(
        profile.id_user,
        { email: profile.email }
      );
      posthog?.group('company', profile.id_organization)
    }
  }, [posthog, profile])
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <Toaster
          position='bottom-right'
          reverseOrder={false}
          gutter={8}
          containerClassName=''
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 3000,
            style: {
              background: '#0A0A0B',
              color: '#fff',
              border: '0.03rem solid white',
            },
          }}
        />
        <Router>
          <Routes>
            <Route path='/' element={<RootLayout />}>
              <Route index element={<ConnectionsPage />} />
              <Route path='/dashboard' element={<DashboardPage />} />
              <Route path='/logs' element={<LogsPage />} />
              <Route path='/tasks' element={<TaskPage />} />
              <Route path='/configuration' element={<ConfigurationPage />} />
              <Route path='/connections' element={<ConnectionsPage />} />
              <Route path='/api-keys' element={<ApiKeysPage />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
