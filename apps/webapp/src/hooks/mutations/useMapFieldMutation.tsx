import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
interface IMapTargetFieldDto {
  attributeId: string;
  source_custom_field_id: string;
  source_provider: string;
  linked_user_id: string;
}

const useMapFieldMutation = () => {
    const mapField = async (data: IMapTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/field-mapping/map`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to map field mapping');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: mapField,
        onMutate: () => {
            toast('Mapping field...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: () => {
            toast.success('Field mapping mapped successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useMapFieldMutation;
