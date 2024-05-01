import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

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
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add project');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: updateStatusWebhookEndpoint,
        onError: (error) => {
            toast("Webhook endpoint update has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
    });
};

export default useWebhookStatusMutation;
