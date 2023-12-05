import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CreateProjectDto } from 'api';


const useProjectMutation = () => {
    const addProject = async (data: CreateProjectDto) => {
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
            toast.success('Project added successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useProjectMutation;
