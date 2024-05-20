/* eslint-disable react/no-unescaped-entities */
'use client'

import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useMapField from "@/hooks/create/useMapField"
import { useEffect, useState } from "react"
import useFieldMappings from "@/hooks/get/useFieldMappings"
import useProviderProperties from "@/hooks/get/useProviderProperties"
import useProjectStore from "@/state/projectStore"
import useLinkedUsers from "@/hooks/get/useLinkedUsers"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
import { CRM_PROVIDERS, providersArray } from "@panora/shared"

const mapFormSchema = z.object({
  attributeId: z.string().min(2, {
    message: "attributeId must be at least 2 characters.",
  }),
  sourceCustomFieldId: z.string().min(2, {
    message: "sourceCustomFieldId must be at least 2 characters.",
  }),
  sourceProvider: z.string().min(2, {
    message: "sourceProvider must be at least 2 characters.",
  }),
  linkedUserId: z.string().min(2, {
    message: "linkedUserId must be at least 2 characters.",
  }),
})

export function MapForm({ onClose, fieldToMap }: {onClose: () => void; fieldToMap?: string}) {  
  const mapForm = useForm<z.infer<typeof mapFormSchema>>({
    resolver: zodResolver(mapFormSchema),
    defaultValues: {
      attributeId: "",
      sourceCustomFieldId: fieldToMap || "",
      sourceProvider: "",
      linkedUserId: ""
    },
  })

  const [sourceCustomFieldsData, setSourceCustomFieldsData] = useState<Record<string, any>[]>([]);
  const [linkedUserId, sourceProvider] = mapForm.watch(['linkedUserId', 'sourceProvider']);
  const [connectorVertical, setConnectorVertical] = useState<string>("");

  const {idProject} = useProjectStore();

  const { data: mappings } = useFieldMappings();
  const { mutate: mutateMapField } = useMapField();
  const { data: linkedUsers } = useLinkedUsers();
  const { data: sourceCustomFields, error, isLoading } = useProviderProperties(linkedUserId, sourceProvider, connectorVertical);
  const connectors = providersArray();
  const posthog = usePostHog()

  useEffect(() => {
    if (sourceCustomFields && sourceCustomFields.data.length > 0  && !isLoading && !error) {
      setSourceCustomFieldsData(sourceCustomFields.data);
    }
  }, [sourceCustomFields, isLoading, error]);

  const handleProviderChange = (provider: string, vertical: string) => {
    mapForm.setValue("sourceProvider", provider);
    setConnectorVertical(vertical);
  }

  function onMapSubmit(values: z.infer<typeof mapFormSchema>) {
    mutateMapField({
      attributeId: values.attributeId.trim(),
      source_custom_field_id: values.sourceCustomFieldId,
      source_provider: values.sourceProvider,
      linked_user_id: values.linkedUserId,
    });
    posthog?.capture("field_mapped", {
      id_project: idProject,
      mode: config.DISTRIBUTION
    })
    onClose();
  }

  return (
    <Form {...mapForm}>
    <form onSubmit={mapForm.handleSubmit(onMapSubmit)}>
    <CardHeader>
        <CardTitle>Map Field</CardTitle>
        <CardDescription>
        Field Mapping allows you to map data from your users' platforms to custom fields on your Panora Unified Models.
        </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
        <div className="space-y-1">
        <FormField
            control={mapForm.control}
            name="attributeId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Panora Custom Field</FormLabel>
                <FormControl>
                <Select 
                    onValueChange={field.onChange} defaultValue={field.value}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Select a defined field" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                    {mappings && mappings
                        .filter(mapping => mapping.status === 'defined')
                        .map(mapping => (
                            <SelectItem key={mapping.id_attribute} value={mapping.id_attribute}>{mapping.slug}</SelectItem>
                        ))
                    }
                    </SelectGroup>
                    </SelectContent>
                </Select>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        </div>
        <div className="space-y-1">
        <FormField
            control={mapForm.control}
            name="linkedUserId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Linked User Id</FormLabel>
                <FormControl>
                <Select 
                    onValueChange={field.onChange} defaultValue={field.value}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Select a linked user" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                    {linkedUsers && linkedUsers.length > 0 && 
                        linkedUsers
                        .filter((linkedUser) => linkedUser.id_project === idProject)
                        .map(linkedUser => (
                            <SelectItem key={linkedUser.id_linked_user} value={linkedUser.id_linked_user}>{linkedUser.linked_user_origin_id}</SelectItem>
                        ))
                    }
                    </SelectGroup>
                    </SelectContent>
                </Select>
                </FormControl>
                <FormDescription>
                    This is the id of the user in your system.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="space-y-1">
        <FormField
            control={mapForm.control}
            name="sourceProvider"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Provider</FormLabel>
                <FormControl>
                <Select
                    onValueChange={(value) => {
                      const [provider, vertical] = value.split("-");
                      handleProviderChange(provider, vertical);
                    }}  
                    defaultValue={field.value}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup> 
                        {connectors.map((connector) => (
                            <SelectItem 
                              value={`${connector.name}-${connector.vertical}`} 
                              key={`${connector.name}-${connector.vertical}`} 
                            >
                              <div className="flex flex-row items-center">
                                <img src={connector.logoPath} className="w-8 h-8 rounded-lg mr-2"/>
                                {`${connector.name.substring(0,1).toUpperCase()}${connector.name.substring(1)}`}
                              </div>
                            </SelectItem>
                          ))}                        
                    </SelectGroup>
                    </SelectContent>
                </Select>
                </FormControl>
                <FormDescription>
                    This is the source provider where the field exists.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="space-y-1">
        <FormField
            control={mapForm.control}
            name="sourceCustomFieldId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Origin Source Field</FormLabel>
                <FormControl>
                <Select
                    onValueChange={field.onChange} defaultValue={field.value}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Select an existent custom field" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                    {isLoading ? "Loading..." : error ? "Error fetching properties" : sourceCustomFieldsData.map(field => (
                        <SelectItem key={field.name} value={field.name}>{field.name}</SelectItem>
                    ))}
                    </SelectGroup>
                    </SelectContent>
                </Select>
                </FormControl>
                <FormDescription>
                    These are all the fields we found in your customer's software.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
    </CardContent>
    <CardFooter>
    <Button size="sm" className="h-7 gap-1 w-full" >Map Field</Button>
    </CardFooter>
    </form>
    </Form>
  )
}