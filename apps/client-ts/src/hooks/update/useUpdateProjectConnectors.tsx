import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface IUpdateProjectConnectorsDto {
    column: string;
    status: boolean;
}

const useUpdateProjectConnectors = () => {
    const queryClient = useQueryClient();
    
    const update = async (data: IUpdateProjectConnectorsDto) => {
        const response = await fetch(`${config.API_URL}/project-connectors`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to update catalog option');
        }
        
        return response.json();
        
    };
    return useMutation({
        mutationFn: update,
        onMutate: () => {
            toast("Catalog option is being updated !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("The updating of Connection Strategy has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Connection Strategy has been updated !", {
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

export default useUpdateProjectConnectors;
