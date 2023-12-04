import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import {MapFieldToProviderDto} from "@api/src/@core/field-mapping/dto/create-custom-field.dto"
import toast from 'react-hot-toast';


const useMapFieldMutation = () => {
    const mapField = async (data: MapFieldToProviderDto) => {
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
