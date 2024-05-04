import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface IDefineTargetFieldDto{
    object_type_owner: string;
    name: string;
    description: string;
    data_type: string;
}

const useDefineFieldMutation = () => {
    const queryClient = useQueryClient()

    const defineField = async (data: IDefineTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/field-mappings/define`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
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
                description: error as any,
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
