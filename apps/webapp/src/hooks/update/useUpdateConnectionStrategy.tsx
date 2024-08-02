import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
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
    const update = async (connectionStrategyData: IUpdateConnectionStrategyDto) => {
        if(connectionStrategyData.updateToggle) {
            const response = await fetch(`${config.API_URL}/connection_strategies/toggle`, {
                method: 'POST',
                body: JSON.stringify({id_cs:connectionStrategyData.id_cs}),
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
        } else {
            const response = await fetch(`${config.API_URL}/connection_strategies/update`, {
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

    const updateCsPromise = (data: IUpdateConnectionStrategyDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await update(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };
    return {
        mutate: useMutation({
            mutationFn: update,
        }),
        updateCsPromise,
    };

};

export default useUpdateConnectionStrategy;
