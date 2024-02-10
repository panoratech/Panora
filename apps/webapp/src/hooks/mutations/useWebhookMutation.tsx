import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"

interface IWebhookDto {
    url: string;
    description?: string;
    id_project: string;
    scope: string[];
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
            toast("Webhook endpoint has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Webhook endpoint creation has failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Webhook endpoint has been created! ", {
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

export default useWebhookMutation;
