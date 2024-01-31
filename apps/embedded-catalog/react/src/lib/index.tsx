import config from '@/helpers/config';
import { getDescription } from '@/helpers/utils';
import useLinkedUserMutation from '@/hooks/mutations/useLinkedUserMutation';
import useLinkedUser from '@/hooks/queries/useLinkedUserId';
import useOAuth from '@/hooks/useOAuth';
import { useEffect, useState } from 'react';


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
  const [providerClicked, setProviderClicked] = useState(false);
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
    providerName: name.toLowerCase(),
    returnUrl: config.ML_FRONTEND_URL, // TODO: Replace with the actual return URL
    projectId: projectId,
    linkedUserId: linkedUserId,
    onSuccess: () => console.log('OAuth successful'),
  });

  const onWindowClose = () => {
  }

  useEffect(() => {
    if (providerClicked && isReady) {
      open(onWindowClose);
    }
  }, [providerClicked, isReady, open]);
  

  const handleClick = () => {    
    setProviderClicked(true);
  };
    
  return (
      <div 
      className="max-w-sm p-6 bg-white border-[0.007em] border-gray-200 rounded-lg shadow dark:bg-zinc-800 hover:border-zinc-900 hover:border-[0.1em] transition-colors duration-200"
      >
          <div className="text-center flex items-center">
            <img src={`public/assets/crm/${name}_logo.png`} width={"35px"} className="pb-5 mr-3 rounded-sm"/>
            <a href="#">
              <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Integrate with {name}</h5>
          </a>
          </div>
          
          <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">{getDescription(name.toLowerCase())}</p>
          <a 
            href="#" className="inline-flex items-center text-indigo-600 hover:underline"
            onClick={handleClick}
          >
              Integrate in one click
              <svg className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"/>
              </svg>
          </a>
      </div> 
  )
};
  
export default ProviderCard;