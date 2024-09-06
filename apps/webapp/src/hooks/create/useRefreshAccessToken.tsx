import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface IRefreshOutputDto {
    access_token: string
}

const useRefreshAccessToken = () => {
    const refreshAccessToken = async (projectId: string) => {
        const response = await fetch(`${config.API_URL}/auth/refresh_tokens`, {
            method: 'POST',
            body: JSON.stringify({
                projectId: projectId
            }),
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
    return useMutation({
        mutationFn: refreshAccessToken,
        onSuccess: (data : IRefreshOutputDto) => {
            Cookies.remove('access_token');
            Cookies.set('access_token', data.access_token, {expires:1});
        },
    });
};

export default useRefreshAccessToken;
