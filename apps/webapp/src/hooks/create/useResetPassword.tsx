import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface ResetPasswordData {
    email: string;
    reset_token: string;
    new_password: string;
}

const useResetPassword = () => {
    const call = async (data: ResetPasswordData) => {
        const response = await fetch(`${config.API_URL}/auth/reset_password`, {
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
    const func = (data: ResetPasswordData) => {
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

export default useResetPassword;
