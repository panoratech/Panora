import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import { api_keys as ApiKey } from 'api';
import Cookies from 'js-cookie';

interface IApiKeyDto {
    id_api_key: string;
}

const useDeleteApiKey = () => {
    const queryClient = useQueryClient();

    const remove = async (apiKeyData: IApiKeyDto) => {
        const response = await fetch(`${config.API_URL}/auth/api-keys/${apiKeyData.id_api_key}`, {
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
        onSuccess: (data: ApiKey) => {
            queryClient.setQueryData<ApiKey[]>(['api-keys'], (oldQueryData = []) => {
                return oldQueryData.filter((api_key) => api_key.id_api_key !== data.id_api_key);
            });
            toast("Api Key deleted !", {
                description: "The api key has been removed from your list.",
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

export default useDeleteApiKey;
