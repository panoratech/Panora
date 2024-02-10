import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"

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
            toast("Webhook endpoint is being updated !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Webhook endpoint update has failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Webhook endpoint has been updated !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export default useWebhookStatusMutation;
