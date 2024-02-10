import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"
interface ICreateTargetFieldDto {
    linked_user_origin_id: string;
    alias: string;
    id_project: string;
}
const useLinkedUserMutation = () => {
    const addLinkedUser = async (linkedUserData: ICreateTargetFieldDto) => {
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
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
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
