import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
interface IDeleteConnectionStrategyDto {
    id_cs: string
}

const useDeleteConnectionStrategy = () => {    
    const remove = async (connectionStrategyData: IDeleteConnectionStrategyDto) => {
        const response = await fetch(`${config.API_URL}/connection_strategies/delete`, {
            method: 'POST',
            body: JSON.stringify({id:connectionStrategyData.id_cs}),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Unknown error occurred");
        }
        
        return response.json();
    };

    const deleteCsPromise = (data: IDeleteConnectionStrategyDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await remove(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };
    /*
    queryClient.setQueryData<ConnectionStrategies[]>(['connection-strategies'], (oldQueryData = []) => {
                return oldQueryData.filter((CS) => CS.id_connection_strategy !== data.id_connection_strategy)
            });
     */

    return {
        mutate: useMutation({
            mutationFn: remove,
        }),
        deleteCsPromise,
    };

};

export default useDeleteConnectionStrategy;
