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
import { RecentSales } from "../dashboard/components/recent-sales";
import { Button } from "../ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { FModal } from "./components/FieldMappingModal"
import { Separator } from "../ui/separator";
import FieldMappingsTable from "./components/FieldMappingsTable";
import AddLinkedAccount from "./components/AddLinkedAccount";

export default function ConfigurationPage() {
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
                        You connected 1389 linked accounts.
                      </CardDescription>
                    </CardHeader>
                    <Separator className="mb-10"/>
                    <CardContent>
                      <RecentSales />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="field-mappings" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="col-span-3 outline">
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
                        You built 30 fields mapping.
                      </CardDescription>
                    </CardHeader>
                    <Separator className="mb-10"/>
                    <CardContent>
                      <FieldMappingsTable/>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>
    );
  }