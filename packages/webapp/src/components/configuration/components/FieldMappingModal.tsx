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
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


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
import useSourceCustomFields from "@/hooks/useSourceCustomFields"
import { useStandardObjects } from "@/hooks/useStandardObjects"

export function FModal({ onClose }: {onClose: () => void}) {
  const [standardModel, setStandardModel] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldDescription, setFieldDescription] = useState('');
  const [fieldType, setFieldType] = useState('');

  const [attributeId, setAttributeId] = useState('');
  const [sourceProvider, setSourceProvider] = useState('');
  const [sourceCustomFieldId, setSourceCustomFieldId] = useState('');
  const [linkedUserId, setLinkedUserId] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sourceCustomFieldsData, setSourceCustomFieldsData] = useState<Record<string, any>[]>([]);

  const { data: mappings } = useFieldMappings();
  const { mutate: mutateDefineField } = useDefineFieldMutation();
  const { mutate: mutateMapField } = useMapFieldMutation();
  const { data: sourceCustomFields, error, isLoading } = useSourceCustomFields(sourceProvider);
  const { data: sObjects } = useStandardObjects();

  useEffect(() => {
    if (sourceCustomFields && !isLoading && !error) {
      setSourceCustomFieldsData(sourceCustomFields);
    }
  }, [sourceCustomFields, isLoading, error]);

  const handleDefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutateDefineField({
      object_type_owner: standardModel,
      name: fieldName,
      description: fieldDescription,
      data_type: fieldType,
    });
    onClose();
  };

  const handleMapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutateMapField({
      attributeId: attributeId,
      source_custom_field_id: sourceCustomFieldId,
      source_provider: sourceProvider,
      linked_user_id: linkedUserId,
    });
    onClose();
  };

  return (
    <Tabs defaultValue="define" className="w-[400px] mt-5">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="define">Define Fields</TabsTrigger>
        <TabsTrigger value="map">Map Fields</TabsTrigger>
      </TabsList>
      <TabsContent value="define">
        <Card>
          <form onSubmit={handleDefineSubmit}>
            <CardHeader>
              <CardTitle>Define</CardTitle>
              <CardDescription>
                Define a custom field you want to enable on unified models. It must be mapped to an existent custom field on your end-user's provider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Standard Model</Label>
                <Select
                  value={standardModel}
                  onValueChange={setStandardModel}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                    {sObjects && sObjects
                        .map(sObject => (
                          <SelectItem key={sObject.id_entity} value={sObject.ressource_owner_id}>{sObject.ressource_owner_id}</SelectItem>
                        ))
                    }
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Name</Label>
                <Input 
                  id="username" 
                  defaultValue="favorite_color" 
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Description</Label>
                <Input 
                  id="username" 
                  defaultValue="favorite color"
                  value={fieldDescription}
                  onChange={(e) => setFieldDescription(e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Field Type</Label>
                <Select
                  value={fieldType}
                  onValueChange={setFieldType}
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
              </div>
            </CardContent>
            <CardFooter>
              <Button>Define Field</Button>
            </CardFooter>
          </form>
        </Card> 
      </TabsContent>
      <TabsContent value="map">
        <Card>
          <form onSubmit={handleMapSubmit}>
            <CardHeader>
              <CardTitle>Map</CardTitle>
              <CardDescription>
                Now that you defined your field, map it to an existent custom field on your end-user's tool.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="current">Field</Label>
                <Select 
                  value={attributeId}
                  onValueChange={setAttributeId}
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
              </div>
              <div className="space-y-1">
                <Label htmlFor="current">Provider</Label>
                <Select
                  value={sourceProvider}
                  onValueChange={setSourceProvider}
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
              </div>
              <div className="space-y-1">
                <Label htmlFor="current">Origin Source Field</Label>
                <Select
                  value={sourceCustomFieldId}
                  onValueChange={setSourceCustomFieldId}
                  
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select an existent custom field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                    {sourceCustomFieldsData.map(field => (
                      <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                    ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">Linked User Id</Label>
                <Input 
                  id="new" 
                  value={linkedUserId}
                  onChange={(e) => setLinkedUserId(e.target.value)} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Map Field</Button>
            </CardFooter>
            </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
