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

const useMagicLinkMutation = ({ onSuccess }: { onSuccess: () => void }) => {
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

  const mutation = useMutation({
    mutationFn: generateLink,
    onSuccess: (data) => {
      setUniqueLink(data.id_invite_link);
      onSuccess();
    },
  });

  return {
    ...mutation,
    mutateWithToast: (data: ILinkDto) =>
      toast.promise(mutation.mutateAsync(data), {
        loading: 'Generating link...',
        success: 'Magic Link Generated successfully!',
        error: 'Error: Failed to generate link',
      }),
  };
};

export default useMagicLinkMutation;
