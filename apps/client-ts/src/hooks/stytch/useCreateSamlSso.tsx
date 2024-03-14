import { createSamlSSOConn } from '@/lib/stytch/api';
import { useCallback, useState } from 'react';

export const useCreateSamlSso = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState(null);

    const mutate = useCallback(async (display_name: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await createSamlSSOConn(display_name)

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
