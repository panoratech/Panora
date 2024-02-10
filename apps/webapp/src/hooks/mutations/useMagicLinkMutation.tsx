import useMagicLinkStore from '@/state/magicLinkStore';
import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"

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
            toast("Magic link is being generated !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Magic link generation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data) => {
            setUniqueLink(data.id_invite_link)
            toast("Magic link has been generated!", {
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

export default useMagicLinkMutation;
