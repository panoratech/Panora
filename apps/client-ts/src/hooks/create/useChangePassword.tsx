import config from '@/lib/config';
import { useMutation } from '@tanstack/react-query';

interface IChangePasswordInputDto {
    id_user: string;
    email: string;
    old_password_hash: string;
    new_password_hash: string;
}

const useChangePassword = () => {
    const changePassword = async (newPasswordData: IChangePasswordInputDto) => {
        // Fetch the token
        const response = await fetch(`${config.API_URL}/auth/change-password`, {
            method: 'POST',
            body: JSON.stringify(newPasswordData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Changing Password Failed!!")
        }

        return response.json();
    };

    const changePasswordPromise = (data: IChangePasswordInputDto) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await changePassword(data);
                resolve(result);

            } catch (error) {
                reject(error);
            }
        });
    };

    return {
        mutationFn: useMutation({
            mutationFn: changePassword,
        }),
        changePasswordPromise
    }
};

export default useChangePassword;
