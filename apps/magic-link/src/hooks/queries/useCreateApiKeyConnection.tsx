import config from '@/helpers/config';
import { useMutation } from '@tanstack/react-query';

interface IGConnectionDto {
  query : {
    providerName: string;           // Name of the API Key provider
    vertical: string;    // Vertical (Crm, Ticketing, etc)
    projectId: string;              // Project ID
    linkedUserId: string;           // Linked User ID
  },
  data: {
    [key : string]: string
  }
}



// Adjusted useCreateApiKey hook to include a promise-returning function
const useCreateApiKeyConnection = () => {
    const createApiKeyConnection = async (apiKeyConnectionData : IGConnectionDto) => {
        const response = await fetch(
            `${config.API_URL}/connections/basicorapikey/callback?state=${encodeURIComponent(JSON.stringify(apiKeyConnectionData.query))}`, {
            method: 'POST', 
            body: JSON.stringify(apiKeyConnectionData.data),
            headers: { 
              'Content-Type': 'application/json',
            },
        });
         
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Unknown error occurred");
        }
        
        return response;
    };
        
    return useMutation({
            mutationFn: createApiKeyConnection,
            onSuccess: () => {
            }
    });      
};

export default useCreateApiKeyConnection;
