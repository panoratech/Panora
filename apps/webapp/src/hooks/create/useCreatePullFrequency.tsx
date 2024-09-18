import { useMutation, useQueryClient } from '@tanstack/react-query';
import config from '@/lib/config';
import Cookies from 'js-cookie';

export type UpdatePullFrequencyData = Record<string, number>;

export const useUpdatePullFrequency = () => {
    const add = async (data: UpdatePullFrequencyData) => {
        const response = await fetch(`${config.API_URL}/sync/internal/pull_frequencies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
        },
        body: JSON.stringify(data),
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update pull frequencies");
        }

        return response.json();
    }

  const createPullFrequencyPromise = (data: UpdatePullFrequencyData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await add(data);
            resolve(result);
            
        } catch (error) {
            reject(error);
        }
    });
    };
    return {
        mutationFn: useMutation({
            mutationFn: add,
        }),
        createPullFrequencyPromise
    }
};

export default useUpdatePullFrequency;
