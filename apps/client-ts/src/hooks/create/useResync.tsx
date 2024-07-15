import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface IDto{
    vertical: string;
    provider: string;
    linkedUserId: string;
}

const useResync = () => {
    const resync = async (data: IDto) => {
        const response = await fetch(`${config.API_URL}/sync/resync`, {
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

    const resyncPromise = (data: IDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await resync(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };
    return {
        mutationFn: useMutation({
            mutationFn: resync,
        }),
        resyncPromise
    }
};

export default useResync;
