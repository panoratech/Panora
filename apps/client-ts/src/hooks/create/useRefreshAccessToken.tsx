import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface IRefreshOutputDto {
    access_token: string
}

const useRefreshAccessToken = () => {
    const refreshAccessToken = async (projectId: string) => {
        const response = await fetch(`${config.API_URL}/auth/refresh-token`, {
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
            throw new Error("Login Failed!!")
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: refreshAccessToken,
        onMutate: () => {
        },
        onError: (error) => {
            toast.error("Refreshing token generation failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data : IRefreshOutputDto) => {
            Cookies.remove('access_token');
            Cookies.set('access_token', data.access_token, {expires:1});
        },
        onSettled: () => {
        },
    });
};

export default useRefreshAccessToken;
