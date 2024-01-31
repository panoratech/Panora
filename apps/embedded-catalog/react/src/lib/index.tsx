import config from '@/helpers/config';
import { findProviderByName } from '@/helpers/utils';
import useLinkedUserMutation from '@/hooks/mutations/useLinkedUserMutation';
import useLinkedUser from '@/hooks/queries/useLinkedUserId';
import useOAuth from '@/hooks/useOAuth';
import { useEffect, useState } from 'react';
import { TailSpin } from  'react-loader-spinner'

const LoadingOverlay = ({ providerName }: { providerName: string }) => {
  const provider = findProviderByName(providerName);
  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="text-center p-6 bg-[#1d1d1d] rounded-lg">
        <div className='icon-wrapper'>
          <img src={provider!.logoPath} alt={provider!.name} className="mx-auto mb-4 w-14 h-14 rounded-xl" />
        </div>
        
        <h4 className="text-lg font-bold mb-2">Continue in {provider!.name}</h4>
        <p className="text-gray-400 mb-4">Accepting oAuth access to Panora</p>
        <div className='flex justify-center items-center'>
          <TailSpin
            height="40"
            width="40"
            color="white"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
         </div>
      </div>
    </div>
  );
};

interface RemoteUserInfo {
  userIdInYourSystem: string;
  companyName: string;
}

interface ProviderCardProp {
  name: string;
  projectId: string;
  linkedUserIdOrRemoteUserInfo: string | RemoteUserInfo;

}
const ProviderCard = ({name, projectId, linkedUserIdOrRemoteUserInfo}: ProviderCardProp) => {
  const [loading, setLoading] = useState(false);
  const [originId, setOriginId] = useState("")

  const { mutate } = useLinkedUserMutation();
  const {data: linkedUser} = useLinkedUser(originId);


  let linkedUserId: string;
  if (typeof linkedUserIdOrRemoteUserInfo === 'string') {
    linkedUserId = linkedUserIdOrRemoteUserInfo;
  } else {
    //create a new linkedUser based on the user data of the saas
    mutate({ 
      linked_user_origin_id: linkedUserIdOrRemoteUserInfo.userIdInYourSystem, 
      alias: linkedUserIdOrRemoteUserInfo.companyName,
      id_project: projectId
    });
    setOriginId(linkedUserIdOrRemoteUserInfo?.userIdInYourSystem)
    //fetch the linkedId
    linkedUserId = linkedUser!.id_linked_user
  }

  const { open, isReady } = useOAuth({
    providerName: name,
    returnUrl: config.ML_FRONTEND_URL, // TODO: Replace with the actual return URL
    projectId: projectId,
    linkedUserId: linkedUserId,
    onSuccess: () => console.log('OAuth successful'),
  });

  const onWindowClose = () => {
    setLoading(false)
  }

  useEffect(() => {
    if (name && isReady) {
        open(onWindowClose);
    }
    
  }, [name, isReady, open]);
  

  const handleClick = () => {
    setLoading(true);
  };
    
  return (
    <>
    {!loading ? 
    <div 
    className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
    onClick={() => handleClick()}
    >
        <div className="text-center flex items-center">
          <img src={`public/assets/crm/${name}_logo.png`} width={"50px"} className="pb-5 mr-3 rounded-sm"/>
          <a href="#">
            <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Integrate with {name}</h5>
        </a>
        </div>
        
        <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">Go to this step by step guideline process on how to certify for your weekly benefits:</p>
        <a href="#" className="inline-flex items-center text-blue-600 hover:underline">
            See our guideline
            <svg className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"/>
            </svg>
        </a>
    </div> : 
      <LoadingOverlay providerName={name}/> }
    </>
  )
};
  
export default ProviderCard;