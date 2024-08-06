import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

export interface IApiKeyDto {
    projectId: string;
    userId: string;
    keyName?: string;
}

// Adjusted useCreateApiKey hook to include a promise-returning function
const useCreateApiKey = () => {
    const addApiKey = async (data: IApiKeyDto) => {
        const response = await fetch(`${config.API_URL}/auth/api_keys`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });
         
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Unknown error occurred");
        }
        
        return response.json();
    };

    // Expose a promise-returning function alongside mutate
    const createApiKeyPromise = (data: IApiKeyDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await addApiKey(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };

    return {
        mutate: useMutation({
            mutationFn: addApiKey,
        }),
        createApiKeyPromise,
    };
};

export default useCreateApiKey;
