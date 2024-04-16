import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"

interface IConnectionStrategyDto {
    projectId: string,
    type: string,
    attributes: string[],
    values: string[],
}

interface IFetchConnectionStrategyDto {
    id_cs:string,
    projectId: string,
    type: string,
    attributes: string[],
    values: string[],
}


const useConnectionStrategyMutation = () => {
    const queryClient = useQueryClient();
    
    const addConnectionStrategy = async (connectionStrategyData: IConnectionStrategyDto) => {
        const response = await fetch(`${config.API_URL}/connections-strategies/create`, {
            method: 'POST',
            body: JSON.stringify(connectionStrategyData),
            headers: {
            'Content-Type': 'application/json',
            },
        });

        // console.log(response.status)
        
        if (!response.ok) {
            throw new Error('Failed to add linked user');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: addConnectionStrategy,
        onMutate: () => {
            toast("Connection Strategy is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("The creation of Connection Strategy has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data) => {
            queryClient.setQueryData<IFetchConnectionStrategyDto[]>(['connection-strategies'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });
            toast("New Connection Strategy has been created !", {
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

export default useConnectionStrategyMutation;
