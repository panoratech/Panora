import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface IApiKeyDto {
    id_api_key: string;
}

const useDeleteApiKey = () => {
    const remove = async (apiKeyData: IApiKeyDto) => {
        const response = await fetch(`${config.API_URL}/auth/api_keys/${apiKeyData.id_api_key}`, {
            method: 'DELETE',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Unknown error occurred");
        }
        return response.json();
    };

    const deleteApiKeyPromise = (data: IApiKeyDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await remove(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };
    return {
        mutate: useMutation({
            mutationFn: remove,
        }),
        deleteApiKeyPromise,
    };
};

export default useDeleteApiKey;
