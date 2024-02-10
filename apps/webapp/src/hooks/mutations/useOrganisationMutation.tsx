import config from '@/utils/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"

interface IOrgDto {
  name: string;
  stripe_customer_id: string;
}
const useOrganisationMutation = () => {
    const queryClient = useQueryClient()
    const addOrg = async (data: IOrgDto) => {
        const response = await fetch(`${config.API_URL}/organisations/create`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add organisation');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: addOrg,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['organisations'],
                refetchType: 'active',
            })
            toast("Organisation has been created !", {
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

export default useOrganisationMutation;
