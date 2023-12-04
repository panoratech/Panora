import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import {CreateOrganizationDto} from "@api/src/@core/organisations/dto/create-organization.dto"
import toast from 'react-hot-toast';


const useOrganisationMutation = () => {
    const addOrg = async (data: CreateOrganizationDto) => {
        const response = await fetch(`${config.API_URL}/organisations/create`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add organisation');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: addOrg,
        onMutate: () => {
            toast('Adding organisation...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: () => {
            toast.success('Organisation added successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useOrganisationMutation;
