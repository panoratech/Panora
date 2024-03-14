import { deleteMember, invite } from '@/lib/stytch/api';
import { useCallback, useState } from 'react';

export const useDeleteMember = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState(null);

    const mutate = useCallback(async (member_id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await deleteMember(member_id)

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setData(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { mutate, isLoading, error, data };
};
