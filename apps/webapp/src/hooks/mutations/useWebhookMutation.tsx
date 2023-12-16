import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface IWebhookDto {
    url: string;
    description?: string;
    secret: string;
    id_project: string;
    scope: string;
}
const useWebhookMutation = () => {
    const addWebhookEndpoint = async (data: IWebhookDto) => {
        const response = await fetch(`${config.API_URL}/webhook`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add project');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: addWebhookEndpoint,
        onMutate: () => {
            toast('Adding webhook endpoint...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: () => {
            toast.success('Webhook added successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useWebhookMutation;
