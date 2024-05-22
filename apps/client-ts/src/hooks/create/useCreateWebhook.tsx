import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface IWebhookDto {
    url: string;
    description?: string;
    id_project: string;
    scope: string[];
}
const useCreateWebhook = () => {
    const queryClient = useQueryClient();
    const add = async (data: IWebhookDto) => {
        const response = await fetch(`${config.API_URL}/webhook`, {
            method: 'POST',
            body: JSON.stringify(data),
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
        mutationFn: add,
        onMutate: () => {
            /*toast("Webhook endpoint has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onError: (error) => {
            /*toast("Webhook endpoint creation has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onSuccess: (data) => {
            queryClient.setQueryData<IWebhookDto[]>(['webhooks'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });            
            toast("Webhook created ! ", {
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

export default useCreateWebhook;
