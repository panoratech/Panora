/* eslint-disable react/no-unescaped-entities */
'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { standardObjects } from "@panora/shared/src/standardObjects"
import useProjectStore from "@/state/projectStore"
import useLinkedUsers from "@/hooks/get/useLinkedUsers"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
import { CRM_PROVIDERS } from "@panora/shared"
import useDefineField from "@/hooks/create/useDefineField"


const defineFormSchema = z.object({
  standardModel: z.string().min(2, {
    message: "standardModel must be at least 2 characters.",
  }),
  fieldName: z.string().min(2, {
    message: "fieldName must be at least 2 characters.",
  }),
  fieldDescription: z.string().min(2, {
    message: "fieldDescription must be at least 2 characters.",
  }),
  fieldType: z.string().min(2, {
    message: "fieldType must be at least 2 characters.",
  }),
})

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

export function FModal({ onClose }: {onClose: () => void}) {

  const defineForm = useForm<z.infer<typeof defineFormSchema>>({
    resolver: zodResolver(defineFormSchema),
    defaultValues: {
      standardModel: "",
      fieldName: "",
      fieldDescription: "",
      fieldType: "",
    },
  })

  const mapForm = useForm<z.infer<typeof mapFormSchema>>({
    resolver: zodResolver(mapFormSchema),
    defaultValues: {
      attributeId: "",
      sourceCustomFieldId: "",
      sourceProvider: "",
      linkedUserId: ""
    },
  })

  const [sourceCustomFieldsData, setSourceCustomFieldsData] = useState<Record<string, any>[]>([]);
  const [ linkedUserId, sourceProvider ] = mapForm.watch(['linkedUserId', 'sourceProvider']);

  const {idProject} = useProjectStore();

  const { data: mappings } = useFieldMappings();
  const { mutate: mutateDefineField } = useDefineField();
  const { mutate: mutateMapField } = useMapField();
  const { data: linkedUsers } = useLinkedUsers();
  // TODO: HANDLE VERTICAL AND PROVIDERS FOR CUSTOM MAPPINGS
  const { data: sourceCustomFields, error, isLoading } = useProviderProperties(linkedUserId,sourceProvider, "crm");
  
  const posthog = usePostHog()

  useEffect(() => {
    if (sourceCustomFields && sourceCustomFields.data.length > 0  && !isLoading && !error) {
      console.log("inside custom fields properties ");
      setSourceCustomFieldsData(sourceCustomFields.data);
    }
  }, [sourceCustomFields, isLoading, error]);


  function onDefineSubmit(values: z.infer<typeof defineFormSchema>) {
    console.log(values)
    mutateDefineField({
      object_type_owner: values.standardModel,
      name: values.fieldName,
      description: values.fieldDescription,
      data_type: values.fieldType,
    });
    posthog?.capture("field_defined", {
      id_project: idProject,
      mode: config.DISTRIBUTION
    })
    onClose();
  }

  function onMapSubmit(values: z.infer<typeof mapFormSchema>) {
    console.log(values)
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
    <Tabs defaultValue="define" className="m-2" >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="define">Create Field</TabsTrigger>
        <TabsTrigger value="map">Map Field</TabsTrigger>
      </TabsList>
      <TabsContent value="define">
        <Card>
          <Form {...defineForm}>
            <form onSubmit={defineForm.handleSubmit(onDefineSubmit)}>
              <CardHeader>
                <CardTitle>Create a custom field</CardTitle>
                <CardDescription>
                  Create a custom field in Panora to extend our unified objects. Once done, you can map this field to existing fields in your end-user's software. Find details in
                  <a href="https://docs.panora.dev/core-concepts/custom-fields" target="_blank" rel="noopener noreferrer"><strong> documentation</strong></a>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                <FormField
                      control={defineForm.control}
                      name="standardModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What object to you want to extend?</FormLabel>
                          <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value} >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select an object" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                              {standardObjects && standardObjects
                                  .map((sObject: string) => (
                                    <SelectItem key={sObject} value={sObject}>{sObject}</SelectItem>
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
                      control={defineForm.control}
                      name="fieldName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Give your Custom Field an identifier</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="ex: hair_color, or lead_score" {...field} 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                  />
                </div>
                <div className="space-y-1">
                  <FormField
                      control={defineForm.control}
                      name="fieldDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="My customer's favorite color" {...field} 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                  />
                </div>
                <div className="space-y-1">
                  <FormField
                      control={defineForm.control}
                      name="fieldType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Type</FormLabel>
                          <FormControl>
                          <Select
                            onValueChange={field.onChange} defaultValue={field.value}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="string">Text</SelectItem>
                                <SelectItem value="int">Number</SelectItem>
                                <SelectItem value="string[]">Text Array</SelectItem>
                                <SelectItem value="int[]">Number Array</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </CardContent>
              <CardFooter>
                <Button className='w-full'>Create Field</Button>
              </CardFooter>
            </form>
          </Form>
        </Card> 
      </TabsContent>
      <TabsContent value="map">
        <Card>
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
                          <SelectTrigger className="w-[180px]">
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
                    name="sourceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <FormControl>
                        <Select
                          onValueChange={field.onChange} defaultValue={field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup> 
                              {
                                CRM_PROVIDERS.map((provider) =>
                                  <SelectItem value={provider} key={provider}>{provider}</SelectItem>
                                )
                              }                              
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
                    name="linkedUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked User Id</FormLabel>
                        <FormControl>
                        <Select 
                          onValueChange={field.onChange} defaultValue={field.value}
                        >
                          <SelectTrigger className="w-[180px]">
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
                    name="sourceCustomFieldId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin Source Field</FormLabel>
                        <FormControl>
                        <Select
                          onValueChange={field.onChange} defaultValue={field.value}
                        >
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select an existent custom field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                            {sourceCustomFieldsData.map(field => (
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
              <Button className='w-full'>Map Field</Button>
            </CardFooter>
          </form>
          </Form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
