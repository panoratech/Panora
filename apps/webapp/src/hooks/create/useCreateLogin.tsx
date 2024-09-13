import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';

type IUserDto = {
  id_user: string;
  email: string;
  first_name: string;
  last_name: string;
  id_organization?: string;
}

interface ILoginInputDto {
    email:string,
    password_hash:string
}

const useCreateLogin = () => {
    const add = async (userData: ILoginInputDto) => {
        // Fetch the token
        console.log("API_URL: ", config.API_URL); // Add this line
        const apiUrl = new URL('/auth/login', config.API_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-Type': 'application/json', 
            },
        });

        if (!response.ok) {
            throw new Error("Login Failed!! ")
        }
        
        return response.json();
    };
    const loginPromise = (data: ILoginInputDto) => {
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
        loginPromise
    }
};

export default useCreateLogin;
