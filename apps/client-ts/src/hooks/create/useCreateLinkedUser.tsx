import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
interface ILinkedUserDto {
    linked_user_origin_id: string;
    alias: string;
    id_project: string;
}
const useCreateLinkedUser = () => {
    const queryClient = useQueryClient();
    
    const add = async (linkedUserData: ILinkedUserDto) => {
        const response = await fetch(`${config.API_URL}/linked-users`, {
            method: 'POST',
            body: JSON.stringify(linkedUserData),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add linked user');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: add,
        onMutate: () => {
            /*toast("Linked user is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onError: (error) => {
            /*toast("The creation of linked user has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onSuccess: (data) => {
            queryClient.setQueryData<ILinkedUserDto[]>(['linked-users'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });
            toast("New linked user created !", {
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

export default useCreateLinkedUser;
