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
import { providersArray } from "@panora/shared"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useQueryClient } from "@tanstack/react-query"


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
  const queryClient = useQueryClient();

  const { data: mappings } = useFieldMappings();
  const { mapMappingPromise } = useMapField();
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
    toast.promise(
      mapMappingPromise({
        attributeId: values.attributeId.trim(),
        source_custom_field_id: values.sourceCustomFieldId,
        source_provider: values.sourceProvider,
        linked_user_id: values.linkedUserId,
      }),
      {
      loading: 'Loading...',
      success: (data: any) => {
        queryClient.setQueryData<any[]>(['mappings'], (oldQueryData = []) => {
          return [...oldQueryData, data];
        });
        return (
          <div className="flex flex-row items-center">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            <div className="ml-2">
              Custom field 
              <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">{`${values.sourceCustomFieldId}`}</Badge>
              has been mapped
            </div>
          </div>
        )
        ;
      },
      error: (err: any) => err.message || 'Error'
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
                    {isLoading ? <p className="text-sm font-bold flex flex-row items-center"><LoadingSpinner className="w-4 mr-2"/>Loading...</p> : error ? <p className="text-sm font-bold">Error fetching properties</p> : sourceCustomFieldsData.map(field => (
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