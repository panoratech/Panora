import './App.css'
import useOAuth from './hooks/useOAuth';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;         // Replace with your OAuth client ID
const SCOPES = 'crm.lists.read%20crm.objects.contacts.read%20crm.objects.contacts.write%20crm.objects.custom.read%20crm.objects.custom.write%20crm.objects.companies.write%20crm.schemas.contacts.read%20crm.objects.feedback_submissions.read%20crm.lists.write%20crm.objects.companies.read%20crm.objects.deals.read%20crm.objects.deals.write%20crm.schemas.contacts.write';          // Replace with your requested scopes
const REDIRECT_URI = 'http://localhost:3000/oauth/callback';   // Replace with your redirect URI

function App() {
  const { open, isReady } = useOAuth({
    linkToken: 'ADD_GENERATED_LINK_TOKEN', // Replace with your link token
    clientId: CLIENT_ID!,
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
    onSuccess: () => console.log('OAuth successful')
  });
  return (
    <>
      <h1>Integrations Flow</h1>
      <div className="card">
        <button disabled={!isReady} onClick={open}>
          Start OAuth Flow
        </button>
      </div>
    </>
  )
}

export default App
