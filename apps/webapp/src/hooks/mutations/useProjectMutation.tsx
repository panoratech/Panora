import config from '@/utils/config';
import { useMutation,useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface IProDto {
    name: string;
    id_organization: string;
}

const useProjectMutation = () => {
    const queryClient = useQueryClient()
    const addProject = async (data: IProDto) => {
        const response = await fetch(`${config.API_URL}/projects/create`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add project');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: addProject,
        onMutate: () => {
            toast('Adding project...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['projects'],
                refetchType: 'active',
            })
            toast.success('Project added successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useProjectMutation;
