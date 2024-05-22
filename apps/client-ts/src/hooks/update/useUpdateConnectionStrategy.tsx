import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import { connection_strategies as ConnectionStrategies } from 'api';
import Cookies from 'js-cookie';

interface IUpdateConnectionStrategyDto {
    id_cs?: string
    updateToggle: boolean,
    projectId?: string,
    type?: string,
    status?: boolean,
    attributes?: string[],
    values?: string[],
}


const useUpdateConnectionStrategy = () => {
    const queryClient = useQueryClient();
    
    const update = async (connectionStrategyData: IUpdateConnectionStrategyDto) => {
        if(connectionStrategyData.updateToggle) {
            console.log(connectionStrategyData.id_cs)
            const response = await fetch(`${config.API_URL}/connections-strategies/toggle`, {
                method: 'POST',
                body: JSON.stringify({id_cs:connectionStrategyData.id_cs}),
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to toggle cs');
            }
            return response.json();
        } else {
            const response = await fetch(`${config.API_URL}/connections-strategies/update`, {
                method: 'POST',
                body: JSON.stringify({
                    id_cs:connectionStrategyData.id_cs,
                    status:connectionStrategyData.status,
                    attributes:connectionStrategyData.attributes,
                    values:connectionStrategyData.values
                }),
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to update cs');
            }
            
            return response.json();
        }
        
    };
    return useMutation({
        mutationFn: update,
        onMutate: () => {
            toast("Connection Strategy is being updated !", {
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
        onSuccess: (data : ConnectionStrategies) => {
            queryClient.setQueryData<ConnectionStrategies[]>(['connection-strategies'], (oldQueryData = []) => {
                return oldQueryData.map((CS) => CS.id_connection_strategy === data.id_connection_strategy ? data : CS)
            });
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

export default useUpdateConnectionStrategy;
