import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface IUpdateProjectConnectorsDto {
    column: string;
    status: boolean;
}

const useUpdateRagSettings = () => {    
    const update = async (data: IUpdateProjectConnectorsDto) => {
        return []
    };

    const updateRagSettingsPromise = (data: IUpdateProjectConnectorsDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await update(data);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        });
    };

    return {
        mutate: useMutation({
            mutationFn: update,
        }),
        updateRagSettingsPromise,
    };
};

export default useUpdateRagSettings;
