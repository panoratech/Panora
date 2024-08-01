import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface ILinkedUserDto {
    linked_user_origin_id: string;
    alias: string;
    id_project: string;
}
const useCreateLinkedUser = () => {    
    const add = async (linkedUserData: ILinkedUserDto) => {
        const response = await fetch(`${config.API_URL}/linked_users/internal`, {
            method: 'POST',
            body: JSON.stringify(linkedUserData),
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
    const createLinkedUserPromise = (data: ILinkedUserDto) => {
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
        createLinkedUserPromise
    };
};

export default useCreateLinkedUser;
