import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import {DefineTargetFieldDto} from "@api/src/@core/field-mapping/dto/create-custom-field.dto"
import toast from 'react-hot-toast';

const useDefineFieldMutation = () => {
    const defineField = async (data: DefineTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/field-mapping/define`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to define field mapping');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: defineField,
        onMutate: (variables) => {
            toast('Defining field...');
        },
        onError: (error, variables, context) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: (data, variables, context) => {
            toast.success('Field mapping defined successfully!');
        },
        onSettled: (data, error, variables, context) => {
        // Clean up or refetch queries here
        },
    });
};

export default useDefineFieldMutation;
