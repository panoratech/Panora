import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface IConnectionStrategyDto {
    type: string,
    attributes: string[],
    values: string[],
}

interface IFetchConnectionStrategyDto {
    id_cs: string,
    type: string,
    attributes: string[],
    values: string[],
}


const useCreateConnectionStrategy = () => {
    const queryClient = useQueryClient();
    
    const add = async (connectionStrategyData: IConnectionStrategyDto) => {
        const response = await fetch(`${config.API_URL}/connections-strategies/create`, {
            method: 'POST',
            body: JSON.stringify(connectionStrategyData),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });

        // console.log(response.status)
        
        if (!response.ok) {
            throw new Error('Failed to add Connection Strategy');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: add,
        onMutate: () => {
            /*toast("Connection Strategy is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onError: (error) => {
            /*toast("The creation of Connection Strategy has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onSuccess: (data) => {
            queryClient.setQueryData<IFetchConnectionStrategyDto[]>(['connection-strategies'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });
            toast("Changes saved !", {
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

export default useCreateConnectionStrategy;
