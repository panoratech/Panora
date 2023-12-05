import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CreateLinkedUserDto } from 'api';


const useLinkedUserMutation = () => {
    const addLinkedUser = async (linkedUserData: CreateLinkedUserDto) => {
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
            toast('Adding linked user...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: () => {
            toast.success('Linked user added successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useLinkedUserMutation;
