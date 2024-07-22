import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import useProfileStore from '@/state/profileStore';
import Cookies from 'js-cookie';


type IUserDto = {
    id_user: string;
    email: string;
    first_name: string;
    last_name: string;
    id_organization?: string;
}

const useUser = () => {
    const {setProfile} = useProfileStore()

    const getUser = async (cookie : string | undefined) => {
        // Fetch the token
        const response = await fetch(`${config.API_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${cookie}`
            },
        });

        if (!response.ok) {
            Cookies.remove('access_token')
            const errorData = await response.json();
            throw new Error(errorData.message || "Unknown error occurred");
        }
        return response.json();
    };
    return useMutation({
        mutationFn: getUser,
        onError: (error) => {
            Cookies.remove('access_token')
            /*toast.error("Fetch User failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onSuccess: (data : IUserDto) => {
            setProfile(data);
        },
        onSettled: () => {
        },
    });
};

export default useUser;
