import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface IWebhookUpdateDto {
    id: string;
    active: boolean;
}
const useWebhookStatusMutation = () => {
    const updateStatusWebhookEndpoint = async (data: IWebhookUpdateDto) => {
        const response = await fetch(`${config.API_URL}/webhook/${data.id}`, {
            method: 'PUT',
            body: JSON.stringify({active: data.active}),
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
        mutationFn: updateStatusWebhookEndpoint,
        onMutate: () => {
            toast('Updating webhook endpoint...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: () => {
            toast.success('Webhook updated successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useWebhookStatusMutation;
