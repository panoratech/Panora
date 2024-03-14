import { invite } from '@/lib/stytch/api';
import { useCallback, useState } from 'react';

export const useInvite = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState(null);

    const mutate = useCallback(async (email: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await invite(email)

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
