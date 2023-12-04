import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import {CreateLinkedUserDto} from "@api/src/@core/linked-users/dto/create-linked-user.dto"
import toast from 'react-hot-toast';


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
        onMutate: (variables) => {
            toast('Adding linked user...');
        },
        onError: (error, variables, context) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: (data, variables, context) => {
            toast.success('Linked user added successfully!');
        },
        onSettled: (data, error, variables, context) => {
        // Clean up or refetch queries here
        },
    });
};

export default useLinkedUserMutation;
