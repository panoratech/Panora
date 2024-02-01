import config from '@/helpers/config';
import { useMutation } from '@tanstack/react-query';
interface ICreateTargetFieldDto {
    linked_user_origin_id: string;
    alias: string;
    id_project: string;
}
const useLinkedUserMutation = () => {
    const addLinkedUser = async (linkedUserData: ICreateTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/linked-users/create`, {
            method: 'POST',
            body: JSON.stringify(linkedUserData),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add linked user');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: addLinkedUser,
        onMutate: () => {
            console.log('Adding linked user...');
        },
        onError: (error) => {
            console.log(`Error: ${error}`);
        },
        onSuccess: () => {
            console.log('Linked user added successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useLinkedUserMutation;
