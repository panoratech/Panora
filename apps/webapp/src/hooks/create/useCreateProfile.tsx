import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';

interface IProfileDto {
    first_name: string;
    last_name: string;
    email: string;
    stytch_id_user: string;
    strategy: string;
    id_organization?: string
}

const useCreateProfile = () => {    
    const add = async (data: IProfileDto) => {
        const response = await fetch(`${config.API_URL}/auth/users/create`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            }, 
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Unknown error occurred");
        }
        
        return response.json();
    };
    const createProfilePromise = (data: IProfileDto) => {
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
        createProfilePromise
        /*
        queryClient.invalidateQueries({
                queryKey: ['profiles'],
                refetchType: 'active',
            })
            queryClient.setQueryData<IProfileDto[]>(['profiles'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });
        */
    };
};

export default useCreateProfile;
