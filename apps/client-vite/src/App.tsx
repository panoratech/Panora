import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import LogsPage from './pages/events/page';
import ConnectionsPage from './pages/connections/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootLayout } from './components/RootLayout/index';
import ConfigurationPage from './pages/configuration/page';
import ApiKeysPage from './pages/api-keys/page';
import DashboardPage from './pages/dashboard/page';
import useProfileStore from './state/profileStore';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

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
    }
  }, [posthog, profile])

  return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              {/*<Route path='/auth/register' element={<RegisterPage />} />
              <Route path='/auth/login' element={<LoginPage />} />*/}
              <Route path='/' element={<RootLayout />}>
                  <Route index element={<ConnectionsPage />} />
                  <Route path='/dashboard' element={<DashboardPage />} />
                  <Route path='/logs' element={<LogsPage />} />
                  <Route path='/configuration' element={<ConfigurationPage />} />
                  <Route path='/connections' element={<ConnectionsPage />} />
                  <Route path='/api-keys' element={<ApiKeysPage />} />
              </Route>
            </Routes>
            <Toaster />
          </QueryParamProvider>
        </Router>
    </QueryClientProvider>
  )
}

export default App
