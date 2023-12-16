import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import useWebhookStatusMutation from "@/hooks/mutations/useWebhookUpdate";
import { useEffect, useState } from "react";

export function WebhooksPage({
  webhooks: initialWebhooks,
  isLoading
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: { webhooks: Record<string, any>[] | undefined; isLoading: boolean }) {
    const [webhooks, setWebhooks] = useState(initialWebhooks);

    const {mutate} = useWebhookStatusMutation();
    const disableWebhook = (webhook_id: string, status: boolean) => {
        mutate({ 
            id: webhook_id,
            active: status,
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
                {isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : webhook.endpoint_description}
            </p>
        </div>
        <div className="ml-auto font-medium">
          {isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : 
            <Switch 
                id="necessary" 
                checked={webhook.active}
                onCheckedChange={() => disableWebhook(webhook.id_webhook_endpoint, !webhook.active)}
            />}
        </div>
      </div>
      )
      })}
      
    </div>
  )
}