import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface IApiKeyDto {
    projectId: string;
    userId: string;
    keyName?: string;
}
const useApiKeyMutation = () => {
    const addApiKey = async (data: IApiKeyDto) => {
        console.log("user id is " + data.userId )

        //TODO: in cloud environment this step must be done when user logs in directly inside his dashboard
        // Fetch the token
        const loginResponse = await fetch(`${config.API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ id_user: data.userId.trim(), password_hash: 'my_password' }),
            headers: {
                'Content-Type': 'application/json', 
            },
        });

        if (!loginResponse.ok) {
            throw new Error('Failed to login');
        }
        const { access_token } = await loginResponse.json();

        const response = await fetch(`${config.API_URL}/auth/generate-apikey`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add api key');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: addApiKey,
        onMutate: () => {
            toast('Adding api key...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: () => {
            toast.success('Api Key added successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useApiKeyMutation;
