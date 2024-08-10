import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface IMapTargetFieldDto {
  attributeId: string;
  source_custom_field_id: string;
  source_provider: string;
  linked_user_id: string;
}

const useMapField = () => {
    const map = async (data: IMapTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/field_mappings/internal/map`, {
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
    const mapMappingPromise = (data: IMapTargetFieldDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await map(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };
    return {
        mutationFn: useMutation({
            mutationFn: map,
        }),
        mapMappingPromise
    }
};

export default useMapField;
