import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';

interface IUserDto {
    first_name: string,
    last_name: string,
    email: string,
    strategy: string,
    password_hash: string,
    id_organisation?: string,
}
const useCreateUser = () => {
    const add = async (userData: IUserDto) => {
        // Fetch the token
        const response = await fetch(`${config.API_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData),
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
    const createUserPromise = (data: IUserDto) => {
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
        createUserPromise
    }

};

export default useCreateUser;
