import config from '@/lib/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
import Cookies from 'js-cookie';

interface IFetchedData {
    authValues:string[]
  }

interface IGetCSCredentialsData {
    type?:string,
    attributes:string[]
  }


const useConnectionStrategyAuthCredentialsMutation = () => {    
    const getCSCredentials = async (data : IGetCSCredentialsData): Promise<string[]> => {
        const response = await fetch(`${config.API_URL}/connections-strategies/credentials`,{
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('access_token')}`,
          },
        })
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
      };

    return useMutation({
        mutationFn: getCSCredentials,
        onError: (error) => {
            toast("The CS credentials fetching failed !", {
                description: error as any,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: (data) => {
            // queryClient.setQueryData<IFetchConnectionStrategyDto[]>(['connection-strategies'], (oldQueryData = []) => {
            //     return [...oldQueryData, data];
            // });
            return data
        },
        onSettled: () => {
        },
    });
};

export default useConnectionStrategyAuthCredentialsMutation;
