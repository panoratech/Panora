import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface IApiKeyDto {
    projectId: string;
    userId: string;
    keyName?: string;
}
const useApiKeyMutation = () => {
    const queryClient = useQueryClient();

    const addApiKey = async (data: IApiKeyDto) => {
        const response = await fetch(`${config.API_URL}/auth/generate-apikey`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
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
            toast("Api key is being generated !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Api key generation failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data) => {
            queryClient.setQueryData<IApiKeyDto[]>(['api-keys'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });
            toast("Api key has been generated !", {
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

export default useApiKeyMutation;
