import config from '@/lib/config';
import useProjectsStore from '@/state/projectsStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import { projects as Project } from 'api';


interface IProDto {
    name: string;
    id_user: string; 
}

const useProjectMutation = () => {
    const queryClient = useQueryClient();
    const {setProjects,projects} = useProjectsStore();
    
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
            toast("Project is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Project creation has failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['projects'],
                refetchType: 'active',
            })
            queryClient.setQueryData<IProDto[]>(['projects'], (oldQueryData = []) => {
                return [...oldQueryData, data];
            });
            // setProjects([...data,projects])
            toast("Project has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export default useProjectMutation;
