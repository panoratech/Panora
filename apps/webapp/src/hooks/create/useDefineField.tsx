import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface IDefineTargetFieldDto{
    object_type_owner: string;
    name: string;
    description: string;
    data_type: string;
}

const useDefineField = () => {
    const define = async (data: IDefineTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/field_mappings/internal/define`, {
            method: 'POST',
            body: JSON.stringify(data),
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

    const defineMappingPromise = (data: IDefineTargetFieldDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await define(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };
    return {
        mutationFn: useMutation({
            mutationFn: define,
        }),
        defineMappingPromise
    }
};

export default useDefineField;
