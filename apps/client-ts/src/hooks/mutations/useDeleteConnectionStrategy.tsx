import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import { connection_strategies as ConnectionStrategies } from 'api';
import Cookies from 'js-cookie';

interface IDeleteConnectionStrategyDto {
    id_cs: string
    
}


const useDeleteConnectionStrategyMutation = () => {
    const queryClient = useQueryClient();
    
    const addConnectionStrategy = async (connectionStrategyData: IDeleteConnectionStrategyDto) => {

        
        console.log(connectionStrategyData.id_cs)
        const response = await fetch(`${config.API_URL}/connections-strategies/delete`, {
            method: 'POST',
            body: JSON.stringify({id:connectionStrategyData.id_cs}),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete cs');
        }
        
        return response.json();
            
        
        
       
        
        
    };
    return useMutation({
        mutationFn: addConnectionStrategy,
        onMutate: () => {
            toast("Connection Strategy is being deleted !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("The deleting of Connection Strategy has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data : ConnectionStrategies) => {
            console.log("After Delete Data Received : ",JSON.stringify(data))
            queryClient.setQueryData<ConnectionStrategies[]>(['connection-strategies'], (oldQueryData = []) => {
                // return [...oldQueryData, data];
                return oldQueryData.filter((CS) => CS.id_connection_strategy!==data.id_connection_strategy)
            });
            toast("Connection Strategy has been deleted !", {
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

export default useDeleteConnectionStrategyMutation;
