import useMagicLinkStore from '@/state/magicLinkStore';
import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ILinkDto {
    email: string;
    linked_user_origin_id: string;
    alias: string;
    id_project: string;
}

const useMagicLinkMutation = () => {
    const generateLink = async (data: ILinkDto) => {
        const response = await fetch(`${config.API_URL}/magic-link/create`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate link');
        }
        
        return response.json();
    };
    const {setUniqueLink} = useMagicLinkStore();

    return useMutation({
        mutationFn: generateLink,
        onMutate: () => {
            toast('Generating link...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: (data) => {
            setUniqueLink(data.id_invite_link)
            toast.success('Magic Link Generated successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useMagicLinkMutation;
