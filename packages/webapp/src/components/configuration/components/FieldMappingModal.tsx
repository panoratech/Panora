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

export function FModal() {
  return (
    <Tabs defaultValue="account" className="w-[400px] mt-5">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Define Fields</TabsTrigger>
        <TabsTrigger value="password">Map Fields</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Define</CardTitle>
            <CardDescription>
              Define a custom field you want to enable on unified models. It must be mapped to an existent custom field on your end-user's provider.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Standard Model</Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="apple">Contact</SelectItem>
                    <SelectItem value="banana">Task</SelectItem>
                    <SelectItem value="blueberry">Note</SelectItem>
                    <SelectItem value="grapes">Company</SelectItem>
                    <SelectItem value="pineapple">Ticket</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Name</Label>
              <Input id="username" defaultValue="favorite_color" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Description</Label>
              <Input id="username" defaultValue="favorite color" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Field Type</Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="apple">string</SelectItem>
                    <SelectItem value="banana">int</SelectItem>
                    <SelectItem value="blueberry">string[]</SelectItem>
                    <SelectItem value="grapes">int[]</SelectItem>
                    <SelectItem value="pineapple">Date</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Define Field</Button>
          </CardFooter>
        </Card> 
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Map</CardTitle>
            <CardDescription>
              Now that you defined your field, map it to an existent custom field on your end-user's tool.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Field</Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a defined field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="apple">fav_color</SelectItem>
                    <SelectItem value="banana">fav_hair</SelectItem>
                    <SelectItem value="blueberry">pet_number</SelectItem>
                    <SelectItem value="grapes">is_admin</SelectItem>
                    <SelectItem value="pineapple">players_status</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="current">Provider</Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="apple">Hubspot</SelectItem>
                    <SelectItem value="banana">Zendesk</SelectItem>
                    <SelectItem value="blueberry">Slack</SelectItem>
                    <SelectItem value="grapes">Asana</SelectItem>
                    <SelectItem value="pineapple">Zoho</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="current">Origin Source Field</Label>
              <Select>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select an existent custom field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="apple">fav_color</SelectItem>
                    <SelectItem value="banana">fav_hair</SelectItem>
                    <SelectItem value="blueberry">pet_number</SelectItem>
                    <SelectItem value="grapes">is_admin</SelectItem>
                    <SelectItem value="pineapple">players_status</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Linked User Id</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Map Field</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
