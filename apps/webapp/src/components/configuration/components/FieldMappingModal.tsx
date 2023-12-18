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
import useDefineFieldMutation from "@/hooks/mutations/useDefineFieldMutation"
import useMapFieldMutation from "@/hooks/mutations/useMapFieldMutation"
import { useEffect, useState } from "react"
import useFieldMappings from "@/hooks/useFieldMappings"
import useProviderProperties from "@/hooks/useProviderProperties"
import { standardOjects } from "shared-types"
import useProjectStore from "@/state/projectStore"
import useLinkedUsers from "@/hooks/useLinkedUsers"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sourceCustomFieldsData, setSourceCustomFieldsData] = useState<Record<string, any>[]>([]);
  const [ linkedUserId, sourceProvider ] = mapForm.watch(['linkedUserId', 'sourceProvider']);

  const {idProject} = useProjectStore();

  const { data: mappings } = useFieldMappings();
  const { mutate: mutateDefineField } = useDefineFieldMutation();
  const { mutate: mutateMapField } = useMapFieldMutation();
  const { data: linkedUsers } = useLinkedUsers();
  const { data: sourceCustomFields, error, isLoading } = useProviderProperties(linkedUserId,sourceProvider);
  
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
    onClose();
  }

  return (
    <Tabs defaultValue="define" className="w-[400px] mt-5">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="define">Define Fields</TabsTrigger>
        <TabsTrigger value="map">Map Fields</TabsTrigger>
      </TabsList>
      <TabsContent value="define">
        <Card>
        <Form {...defineForm}>
          <form onSubmit={defineForm.handleSubmit(onDefineSubmit)}>
            <CardHeader>
              <CardTitle>Define</CardTitle>
              <CardDescription>
                Define a custom field you want to enable on unified models. It must be mapped to an existent custom field on your end-user's provider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
              <FormField
                    control={defineForm.control}
                    name="standardModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Standard Model</FormLabel>
                        <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value} >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                            {standardOjects && standardOjects
                                .map(sObject => (
                                  <SelectItem key={sObject} value={sObject}>{sObject}</SelectItem>
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
                    control={defineForm.control}
                    name="fieldName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="favorite_color" {...field} 
                          />
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
                    control={defineForm.control}
                    name="fieldDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="favorite color" {...field} 
                          />
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
                    control={defineForm.control}
                    name="fieldType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Type</FormLabel>
                        <FormControl>
                        <Select
                          onValueChange={field.onChange} defaultValue={field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="string">string</SelectItem>
                              <SelectItem value="int">int</SelectItem>
                              <SelectItem value="string[]">string[]</SelectItem>
                              <SelectItem value="int[]">int[]</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
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
            </CardContent>
            <CardFooter>
              <Button>Define Field</Button>
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
              <CardTitle>Map</CardTitle>
              <CardDescription>
                Now that you defined your field, map it to an existent custom field on your end-user's tool.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <FormField
                    control={mapForm.control}
                    name="attributeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field</FormLabel>
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
                          onValueChange={field.onChange} defaultValue={field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="hubspot">Hubspot</SelectItem>
                              <SelectItem value="zendesk">Zendesk</SelectItem>
                              <SelectItem value="slack">Slack</SelectItem>
                              <SelectItem value="asana">Asana</SelectItem>
                              <SelectItem value="zoho">Zoho</SelectItem>
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
                          This is the id of the user in your system.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Map Field</Button>
            </CardFooter>
          </form>
          </Form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
