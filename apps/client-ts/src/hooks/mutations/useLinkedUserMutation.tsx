import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
interface ILinkedUserDto {
    linked_user_origin_id: string;
    alias: string;
    id_project: string;
}
const useLinkedUserMutation = () => {
    const queryClient = useQueryClient();
    
    const addLinkedUser = async (linkedUserData: ILinkedUserDto) => {
        const response = await fetch(`${config.API_URL}/linked-users/create`, {
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
        mutationFn: addLinkedUser,
        onMutate: () => {
            toast("Linked user is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("The creation of linked user has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data) => {
            queryClient.setQueryData<ILinkedUserDto[]>(['linked-users'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });
            toast("New linked user has been created !", {
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

export default useLinkedUserMutation;
