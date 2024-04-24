import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner"
interface IMapTargetFieldDto {
  attributeId: string;
  source_custom_field_id: string;
  source_provider: string;
  linked_user_id: string;
}

const useMapFieldMutation = () => {
    const mapField = async (data: IMapTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/field-mapping/map`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to map field mapping');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: mapField,
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

export default useMapFieldMutation;
