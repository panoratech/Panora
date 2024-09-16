import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface IConnectionStrategyDto {
    type: string,
    attributes: string[],
    values: string[],
    status?: boolean
}

const useCreateConnectionStrategy = () => {    
    const add = async (connectionStrategyData: IConnectionStrategyDto) => {
        const response = await fetch(`${config.API_URL}/connection_strategies/create`, {
            method: 'POST',
            body: JSON.stringify(connectionStrategyData),
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

     // Expose a promise-returning function alongside mutate
     const createCsPromise = (data: IConnectionStrategyDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await add(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };

    return {
        mutationFn: useMutation({
            mutationFn: add,
        }),
        createCsPromise
    };
};

export default useCreateConnectionStrategy;
