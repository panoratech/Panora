import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface IGetCSCredentialsData {
  type?:string,
  attributes:string[]
}

const useConnectionStrategyAuthCredentials = () => {    
    const getCSCredentials = async (data : IGetCSCredentialsData): Promise<string[]> => {
        const response = await fetch(`${config.API_URL}/connection_strategies/credentials`,{
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('access_token')}`,
          },
        })
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Unknown error occurred");
        }
        return response.json();
      };

    return useMutation({
        mutationFn: getCSCredentials,
        onError: (error) => {
            /*toast("The CS credentials fetching failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })*/
        },
        onSuccess: (data) => {
          return data
        },
        onSettled: () => {
        },
    });
};

export default useConnectionStrategyAuthCredentials;
