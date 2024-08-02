import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface IWebhookUpdateDto {
    id: string;
    active: boolean;
}
const useUpdateWebhookStatus = () => {
    const update = async (data: IWebhookUpdateDto) => {
        const response = await fetch(`${config.API_URL}/webhooks/internal/${data.id}`, {
            method: 'PUT',
            body: JSON.stringify({active: data.active}),
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

    const updateWebhookPromise = (data: IWebhookUpdateDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await update(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };

    return {
        mutate: useMutation({
            mutationFn: update,
        }),
        updateWebhookPromise,
    };
};

export default useUpdateWebhookStatus;
