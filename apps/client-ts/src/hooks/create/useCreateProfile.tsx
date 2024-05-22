import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"

interface IProfileDto {
    first_name: string;
    last_name: string;
    email: string;
    stytch_id_user: string;
    strategy: string;
    id_organization?: string
}

const useCreateProfile = () => {
    const queryClient = useQueryClient();
    
    const add = async (data: IProfileDto) => {
        const response = await fetch(`${config.API_URL}/auth/users/create`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            }, 
        });
        
        if (!response.ok) {
            throw new Error('Failed to add profile');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: add,
        onMutate: () => {
            /*toast("Profile is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onError: (error) => {
            /*toast("Profile creation has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['profiles'],
                refetchType: 'active',
            })
            queryClient.setQueryData<IProfileDto[]>(['profiles'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });
            toast("Profile created !", {
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

export default useCreateProfile;
