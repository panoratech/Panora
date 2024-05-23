import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
interface ILinkedUserDto {
    linked_user_origin_id: string;
    alias: string;
    id_project: string;
}
const useCreateLinkedUser = () => {    
    const add = async (linkedUserData: ILinkedUserDto) => {
        const response = await fetch(`${config.API_URL}/linked-users`, {
            method: 'POST',
            body: JSON.stringify(linkedUserData),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add linked user');
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
