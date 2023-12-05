import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface IDefineTargetFieldDto{
    object_type_owner: string;
    name: string;
    description: string;
    data_type: string;
}

const useDefineFieldMutation = () => {
    const defineField = async (data: IDefineTargetFieldDto) => {
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
        onMutate: () => {
            toast('Defining field...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: () => {
            toast.success('Field mapping defined successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useDefineFieldMutation;
