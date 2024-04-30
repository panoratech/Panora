import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import useProfileStore from '@/state/profileStore';
import { projects as Project } from 'api';
import Cookies from 'js-cookie';


type IUserDto = {
    id_user: string;
    email: string;
    first_name: string;
    last_name: string;
    id_organization?: string;
  }


const useFetchUserMutation = () => {

    const {setProfile} = useProfileStore()

    const verifyUser = async (cookie : string | undefined) => {
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
            throw new Error("Fetch User Failed!!")
        }
         
        return response.json();
    };
    return useMutation({
        mutationFn: verifyUser,
        onMutate: () => {
            // toast("Fetching the user !", {
            //     description: "",
            //     action: {
            //       label: "Close",
            //       onClick: () => console.log("Close"),
            //     },
            // })
        },
        onError: (error) => {
            Cookies.remove('access_token')
            toast.error("Fetch User failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data : IUserDto) => {

            setProfile(data);
            // Cookies.set('access_token',data.access_token,{expires:1});
            // console.log("Bearer Token in client Side : ",data.access_token);

            toast.success("User has been fetched !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export default useFetchUserMutation;
