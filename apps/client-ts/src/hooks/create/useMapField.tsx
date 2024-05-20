import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface IMapTargetFieldDto {
  attributeId: string;
  source_custom_field_id: string;
  source_provider: string;
  linked_user_id: string;
}

const useMapField = () => {
    const map = async (data: IMapTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/field-mappings/map`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to map field mapping');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: map,
        onMutate: () => {
            toast("Field is being mapped !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Field mapping failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
            
        },
        onSuccess: () => {
            toast("Field has been mapped !", {
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

export default useMapField;
