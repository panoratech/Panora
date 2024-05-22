import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"

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
            throw new Error("Email already associated with other account!!")
        }

        return response.json();
    };
    return useMutation({
        mutationFn: add,
        onMutate: () => {
            /*toast("User is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onError: (error) => {
            /*toast("User generation failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onSuccess: (data) => {
            
            toast("User created !", {
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

export default useCreateUser;
