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
import { LinkedUsersPage } from "./components/LinkedUsersPage";
import { Button } from "../ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { FModal } from "./components/FieldMappingModal"
import { Separator } from "../ui/separator";
import FieldMappingsTable from "./components/FieldMappingsTable";
import AddLinkedAccount from "./components/AddLinkedAccount";
import useLinkedUsers from "@/hooks/useLinkedUsers";
import useFieldMappings from "@/hooks/fieldMappings/useFieldMappings";

export default function ConfigurationPage() {
  const { data: linkedUsers, isLoading, error } = useLinkedUsers();
  const { mappings, isLoading: isFieldMappingsLoading, error: isFieldMappingsError } = useFieldMappings();

  if(isLoading){
    console.log("loading linked users..");
  }

  if(error){
    console.log("error linked users..");
  }

  if(isFieldMappingsLoading){
    console.log("loading FieldMappingsLoading..");
  }

  if(isFieldMappingsError){
    console.log("error isFieldMappingsError..");
  }

  const mappingTs = mappings?.map(mapping => ({
    standard_object: mapping.ressource_owner_type, // replace with appropriate mapping
    source_app: mapping.source, // replace with appropriate mapping
    status: mapping.status,
    category: mapping.ressource_owner_type, // replace with appropriate mapping
    source_field: mapping.remote_id, // replace with appropriate mapping
    destination_field: mapping.slug, // replace with appropriate mapping
    data_type: mapping.data_type,
  }))

  return (
    <div className="flex items-center justify-between space-y-2">
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
              <TabsTrigger value="oauth">
                oAuth
              </TabsTrigger>
            </TabsList>
            <TabsContent value="linked-accounts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                <AddLinkedAccount/>
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left">Your Linked Accounts</CardTitle>
                    <CardDescription className="text-left">
                      You connected {linkedUsers?.length} linked accounts.
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-10"/>
                  <CardContent>
                    <LinkedUsersPage linkedUsers={linkedUsers} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="field-mappings" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="col-span-3">
                      <PlusCircledIcon className="mr-2 h-4 w-4" />
                      Add Field Mapping
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:w-[450px]">
                  <FModal/>
                </DialogContent>
              </Dialog>
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left">Your Fields Mapping</CardTitle>
                    <CardDescription className="text-left">
                      You built {mappings?.length} fields mapping.
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-10"/>
                  <CardContent>
                    <FieldMappingsTable mappings={mappingTs} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
  );
  }