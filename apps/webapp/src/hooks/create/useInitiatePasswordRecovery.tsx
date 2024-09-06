import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

const useInitiatePasswordRecovery = () => {
    const call = async (data: {
        email: string
    }) => {
        const response = await fetch(`${config.API_URL}/auth/password_reset_request`, {
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
    const func = (data: {
        email: string
    }) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await call(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };
    return {
        mutationFn: useMutation({
            mutationFn: call,
        }),
        func
    }
};

export default useInitiatePasswordRecovery;
