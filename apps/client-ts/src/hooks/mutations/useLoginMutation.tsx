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

interface ILoginInputDto {
    email:string,
    password_hash:string
}



interface ILoginOutputDto {
    user: IUserDto,
    access_token: string

}


const useLoginMutation = () => {

    const {setProfile} = useProfileStore()

    const loginUser = async (userData: ILoginInputDto) => {
        // Fetch the token
        const response = await fetch(`${config.API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-Type': 'application/json', 
            },
        });


 
        if (!response.ok) {
            throw new Error("Login Failed!!")
        }
        
        
        
        
        return response.json();
    };
    return useMutation({
        mutationFn: loginUser,
        onMutate: () => {
            toast("User is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("User generation failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data : ILoginOutputDto) => {

            setProfile(data.user);
            Cookies.set('access_token',data.access_token,{expires:1});

            toast("User has been generated !", {
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

export default useLoginMutation;
