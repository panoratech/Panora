import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"

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
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
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
