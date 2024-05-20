/* eslint-disable react/jsx-key */
'use client'

import { DataTable } from "@/components/shared/data-table";
import { DataTableLoading } from "@/components/shared/data-table-loading";
import { useEffect, useState } from "react";
import { useColumns } from "./columns";

export interface Webhook {
  scope: string[];
  url: string;
  endpoint_description: string | null;
  secret: string;
  id_webhook_endpoint: string;
  active: boolean;
}
export function WebhooksPage({
  webhooks: initialWebhooks,
  isLoading
}: { webhooks: Webhook[] | undefined; isLoading: boolean }) {
  const [webhooks, setWebhooks] = useState<Webhook[] | undefined>(initialWebhooks);

  const columns = useColumns(webhooks, setWebhooks);

  useEffect(() => {
    const whs = initialWebhooks?.map((wh) => ({
      scope: wh.scope,
      url: wh.url,
      endpoint_description: wh.endpoint_description,
      secret: wh.secret,
      id_webhook_endpoint: wh.id_webhook_endpoint,
      active: wh.active
    }));
    setWebhooks(whs)
  }, [initialWebhooks]);

  return (
    <div className="space-y-8">
      {isLoading && <DataTableLoading data={[]} columns={columns}/>}
      {webhooks && <DataTable data={webhooks} columns={columns} />}
    </div>
  )
}