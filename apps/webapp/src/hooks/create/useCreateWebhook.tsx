import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface IWebhookDto {
    url: string;
    description?: string;
    scope: string[];
}
const useCreateWebhook = () => {
    const add = async (data: IWebhookDto) => {
        const response = await fetch(`${config.API_URL}/webhooks/internal`, {
            method: 'POST',
            body: JSON.stringify(data),
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

    const createWebhookPromise = (data: IWebhookDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await add(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };

    return {
        mutationFn: useMutation({
            mutationFn: add,
        }),
        createWebhookPromise
    }
};

export default useCreateWebhook;
