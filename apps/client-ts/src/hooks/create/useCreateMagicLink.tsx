import useMagicLinkStore from '@/state/magicLinkStore';
import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface ILinkDto {
    email: string;
    linked_user_origin_id: string;
    alias: string;
    id_project: string;
}

const useCreateMagicLink = () => {
    const add = async (data: ILinkDto) => {
        const response = await fetch(`${config.API_URL}/magic-links`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate link');
        }
        
        return response.json();
    };
    const {setUniqueLink} = useMagicLinkStore();

    return useMutation({
        mutationFn: add,
        onMutate: () => {
            /*toast("Magic link is being generated !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onError: (error) => {
            /*toast("Magic link generation failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onSuccess: (data) => {
            setUniqueLink(data.id_invite_link)
            toast("Magic link generated!", {
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

export default useCreateMagicLink;
