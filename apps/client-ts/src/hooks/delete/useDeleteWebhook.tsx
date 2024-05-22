import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import { webhook_endpoints as Webhook } from 'api';
import Cookies from 'js-cookie';

interface IWebhookDto {
    id_webhook: string;
}

const useDeleteWebhook = () => {
    const queryClient = useQueryClient();

    const remove = async (webhookData: IWebhookDto) => {
        const response = await fetch(`${config.API_URL}/webhook/${webhookData.id_webhook}`, {
            method: 'DELETE',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete api key');
        }
        return response.json();
    };
    return useMutation({
        mutationFn: remove,
        onMutate: () => {
            /*toast("api key is being deleted !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onError: (error) => {
                /*toast("The deleting of api key has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onSuccess: (data: Webhook) => {
            queryClient.setQueryData<Webhook[]>(['webhooks'], (oldQueryData = []) => {
                return oldQueryData.filter((wh) => wh.id_webhook_endpoint !== data.id_webhook_endpoint);
            });
            toast("Webhook deleted !", {
                description: "The webhook has been removed from your list.",
                action: {
                    label: "Close",
                    onClick: () => console.log("Close"),
                },
            });
        },
        onSettled: () => {
        },
    });
};

export default useDeleteWebhook;
