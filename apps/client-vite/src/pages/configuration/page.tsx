'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { LinkedUsersPage } from "@/components/Configuration/LinkedUsersPage";
import { Button } from "@/components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { FModal } from "@/components/Configuration/FieldMappingModal"
import { Separator } from "@/components/ui/separator";
import FieldMappingsTable from "@/components/Configuration/FieldMappingsTable";
import AddLinkedAccount from "@/components/Configuration/AddLinkedAccount";
import useLinkedUsers from "@/hooks/useLinkedUsers";
import useFieldMappings from "@/hooks/useFieldMappings";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { LoadingSpinner } from "@/components/Connection/LoadingSpinner";
import AddWebhook from "@/components/Configuration/AddWebhook";
import { cn } from "@/lib/utils";
import { WebhooksPage } from "@/components/Configuration/WebhooksPage";
import useWebhooks from "@/hooks/useWebhooks";
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config";
import useProjectStore from "@/state/projectStore";
import AddAuthCredentials from "@/components/Configuration/AddAuthCredentials";
import AuthCredentialsTable from "@/components/Configuration/AuthCredentialsTable";
import useConnectionStrategies from "@/hooks/useConnectionStrategies";
import { extractAuthMode,extractProvider,extractVertical} from '@panora/shared'

export default function Page() {
  const {idProject} = useProjectStore();

  const { data: linkedUsers, isLoading, error } = useLinkedUsers();
  const { data: webhooks, isLoading: isWebhooksLoading, error: isWebhooksError } = useWebhooks();
  const {data: ConnectionStrategies, isLoading: isConnectionStrategiesLoading,error: isConnectionStategiesError} = useConnectionStrategies(idProject)

  const { data: mappings, isLoading: isFieldMappingsLoading, error: isFieldMappingsError } = useFieldMappings();
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const posthog = usePostHog()

  if(error){
    console.log("error linked users..");
  }

  if(isFieldMappingsLoading){
    console.log("loading FieldMappingsLoading..");
  }

  if(isFieldMappingsError){
    console.log("error isFieldMappingsError..");
  }

  if(isWebhooksLoading){
    console.log("loading webhooks..");
  }

  if(isWebhooksError){
    console.log("error fetching webhooks..");
  }

  if(isConnectionStrategiesLoading)
  {
    console.log("loading Connection Strategies...");
  }

  if(isConnectionStategiesError)
  {
    console.log("error Fetching connection Strategies!")
  }

  const mappingTs = mappings?.map(mapping => ({
    standard_object: mapping.ressource_owner_type,
    source_app: mapping.source,
    status: mapping.status,
    category: mapping.ressource_owner_type, 
    source_field: mapping.remote_id, 
    destination_field: mapping.slug,
    data_type: mapping.data_type,
  }))

  // console.log(ConnectionStrategies)

  const mappingConnectionStrategies = ConnectionStrategies?.map(cs => ({
    id_cs : cs.id_connection_strategy,
    provider_name : extractProvider(cs.type),
    auth_type: extractAuthMode(cs.type),
    vertical: extractVertical(cs.type),
    type: cs.type,
    status: cs.status
  }))

  console.log(mappingConnectionStrategies)

  return (
    
    <div className="flex flex-col pl-[200px] items-center justify-between space-y-2">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
          </div>
          <Tabs defaultValue="linked-accounts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="linked-accounts">Linked Accounts</TabsTrigger>
              <TabsTrigger value="field-mappings">
                Field Mapping
              </TabsTrigger>
              <TabsTrigger value="webhooks">
                Webhooks
              </TabsTrigger>
              <TabsTrigger value="0auth">
                0Auth Credentials
              </TabsTrigger>
            </TabsList>
            <TabsContent value="linked-accounts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                <AddLinkedAccount/>
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left">Your Linked Accounts</CardTitle>
                    <CardDescription className="text-left">
                      You connected {linkedUsers ? linkedUsers.length : <Skeleton className="w-[20px] h-[12px] rounded-md" />} linked accounts.
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-10"/>
                  <CardContent>
                    <LinkedUsersPage linkedUsers={linkedUsers} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="field-mappings" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-[200px] justify-between")}
                    onClick={() => {
                      posthog?.capture("add_field_mappings_button_clicked", {
                        id_project: idProject,
                        mode: config.DISTRIBUTION
                    })}}
                  >
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Add Field Mappings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:w-[450px]">
                  <FModal onClose={handleClose}/>
                </DialogContent>
              </Dialog>
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left">Your Fields Mapping</CardTitle>
                    <CardDescription className="text-left">
                      You built {mappings ? mappings.length : <Skeleton className="w-[20px] h-[12px] rounded-md" />} fields mapping.
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-10"/>
                  <CardContent>
                    <FieldMappingsTable mappings={mappingTs} isLoading={isFieldMappingsLoading} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                <AddWebhook/>
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left">Your Webhooks</CardTitle>
                    <CardDescription className="text-left">
                      You enabled {webhooks ? webhooks.length : <Skeleton className="w-[20px] h-[12px] rounded-md" />} webhooks.
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-10"/>
                  <CardContent>
                    <WebhooksPage webhooks={webhooks} isLoading={isWebhooksLoading} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="0auth" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                <AddAuthCredentials/>
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left">Your Providers</CardTitle>
                    <CardDescription className="text-left">
                      Use and setup the credentials of your providers.
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-10"/>
                  <CardContent>
                    <AuthCredentialsTable mappings={mappingConnectionStrategies} isLoading={false} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
  );
  }