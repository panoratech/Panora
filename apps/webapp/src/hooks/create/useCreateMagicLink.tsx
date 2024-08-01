import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface ILinkDto {
    email: string;
    linked_user_origin_id: string;
    alias: string;
    id_project: string;
}

const useCreateMagicLink = () => {
    const add = async (data: ILinkDto) => {
        const response = await fetch(`${config.API_URL}/magic_links`, {
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
    const createMagicLinkPromise = (data: ILinkDto) => {
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
        createMagicLinkPromise
    };
};

export default useCreateMagicLink;
