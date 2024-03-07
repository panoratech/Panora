/* eslint-disable react/jsx-key */
'use client'

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import useWebhookStatusMutation from "@/hooks/mutations/useWebhookUpdate";
import { useEffect, useState } from "react";

export function WebhooksPage({
  webhooks: initialWebhooks,
  isLoading
}: { webhooks: Record<string, any>[] | undefined; isLoading: boolean }) {
    const [webhooks, setWebhooks] = useState(initialWebhooks);
    const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

    const {mutate} = useWebhookStatusMutation();
    const disableWebhook = (webhook_id: string, status: boolean) => {
        mutate({ 
            id: webhook_id,
            active: status,
        }, {
          onSuccess: () => {
              // Find the index of the webhook to update
              const index = webhooks!.findIndex(webhook => webhook.id_webhook_endpoint === webhook_id);
              if (index !== -1) {
                  // Create a new array with all previous webhooks
                  const updatedWebhooks = [...webhooks!];
                  // Update the specific webhook's active status
                  updatedWebhooks[index].active = status;
                  // Set the updated webhooks array to state
                  setWebhooks(updatedWebhooks);
              }
          }
      });
    }

    useEffect(() => {
        setWebhooks(initialWebhooks);
    }, [initialWebhooks]);

  return (
    <div className="space-y-8">
      {webhooks && webhooks.map((webhook)=>{
        return (
        <div className="flex items-center">
        
        <div className="ml-4 space-y-1">
            <p className="text-sm text-left text-muted-foreground mb-2">
                <Badge className="">{isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : webhook.scope}</Badge>
            </p>
            <p className="text-sm font-medium text-left leading-none">
            <Badge variant="outline">{isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : webhook.url}</Badge>
            </p>
            <p className="text-sm text-left text-muted-foreground">
                {isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : 
                  webhook.endpoint_description
                }
            </p>
            <p className="text-sm text-left text-muted-foreground" onClick={() => setShowSecret({...showSecret, [webhook.id_webhook_endpoint]: true})}>
            <Badge variant={"outline"}>
              {isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : 
                showSecret[webhook.id_webhook_endpoint] ? 
                <div className="flex flex-row" onClick={() => navigator.clipboard.writeText(webhook.secret)}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  <p className="ml-2">{webhook.secret}</p>
                </div> : 
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.6788 2.95419C10.0435 2.53694 9.18829 2.54594 8.51194 3.00541C8.35757 3.11027 8.1921 3.27257 7.7651 3.69957L7.14638 4.31829C6.95112 4.51355 6.63454 4.51355 6.43928 4.31829C6.24401 4.12303 6.24401 3.80645 6.43928 3.61119L7.058 2.99247C7.0725 2.97797 7.08679 2.96366 7.1009 2.94955C7.47044 2.57991 7.70691 2.34336 7.95001 2.17822C8.94398 1.50299 10.2377 1.46813 11.2277 2.11832C11.4692 2.27689 11.7002 2.508 12.0515 2.85942C12.0662 2.8741 12.081 2.88898 12.0961 2.90408C12.1112 2.91917 12.1261 2.93405 12.1408 2.94871C12.4922 3.30001 12.7233 3.53102 12.8819 3.77248C13.5321 4.76252 13.4972 6.05623 12.822 7.0502C12.6568 7.2933 12.4203 7.52976 12.0507 7.89929C12.0366 7.9134 12.0222 7.92771 12.0077 7.94221L11.389 8.56093C11.1938 8.7562 10.8772 8.7562 10.6819 8.56093C10.4867 8.36567 10.4867 8.04909 10.6819 7.85383L11.3006 7.23511C11.7276 6.80811 11.8899 6.64264 11.9948 6.48827C12.4543 5.81192 12.4633 4.95675 12.046 4.32141C11.9513 4.17714 11.8009 4.02307 11.389 3.61119C10.9771 3.1993 10.8231 3.04893 10.6788 2.95419ZM4.31796 6.43961C4.51322 6.63487 4.51322 6.95146 4.31796 7.14672L3.69924 7.76544C3.27224 8.19244 3.10993 8.35791 3.00507 8.51227C2.54561 9.18863 2.53661 10.0438 2.95385 10.6791C3.0486 10.8234 3.19896 10.9775 3.61085 11.3894C4.02274 11.8012 4.17681 11.9516 4.32107 12.0464C4.95642 12.4636 5.81158 12.4546 6.48794 11.9951C6.6423 11.8903 6.80777 11.728 7.23477 11.301L7.85349 10.6823C8.04875 10.487 8.36533 10.487 8.5606 10.6823C8.75586 10.8775 8.75586 11.1941 8.5606 11.3894L7.94188 12.0081C7.92738 12.0226 7.91307 12.0369 7.89897 12.051C7.52943 12.4206 7.29296 12.6572 7.04986 12.8223C6.05589 13.4976 4.76219 13.5324 3.77214 12.8822C3.53068 12.7237 3.29967 12.4925 2.94837 12.1411C2.93371 12.1264 2.91883 12.1116 2.90374 12.0965C2.88865 12.0814 2.87377 12.0665 2.8591 12.0518C2.50766 11.7005 2.27656 11.4695 2.11799 11.2281C1.4678 10.238 1.50265 8.94432 2.17788 7.95035C2.34303 7.70724 2.57957 7.47077 2.94922 7.10124C2.96333 7.08713 2.97763 7.07283 2.99213 7.05833L3.61085 6.43961C3.80611 6.24435 4.12269 6.24435 4.31796 6.43961Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>                
                  <p className="ml-2">Reveal Key</p>
                </>
              }
            </Badge>
            </p>
        </div>
        <div className="ml-auto font-medium">
          {isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : 
            <Switch 
                className="data-[state=checked]:bg-green-400 data-[state=unchecked]:bg-red-500"
                id="necessary" 
                checked={webhook.active}
                onCheckedChange={() => disableWebhook(webhook.id_webhook_endpoint, !webhook.active)}
            />
          }
        </div>
      </div>
      )
      })}
      
    </div>
  )
}