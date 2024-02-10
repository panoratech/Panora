import config from '@/utils/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"

interface IDefineTargetFieldDto{
    object_type_owner: string;
    name: string;
    description: string;
    data_type: string;
}

const useDefineFieldMutation = () => {
    const queryClient = useQueryClient()

    const defineField = async (data: IDefineTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/field-mapping/define`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to define field mapping');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: defineField,
        onMutate: () => {
            toast("Field mapping is being defined !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Field mapping definition failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data) => {
            queryClient.setQueryData<IDefineTargetFieldDto[]>(['mappings'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });
            toast("Field mapping has been defined !", {
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

export default useDefineFieldMutation;
