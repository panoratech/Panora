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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FModal } from "./components/FieldMappingModal"
import { Separator } from "../ui/separator";
import FieldMappingsTable from "./components/FieldMappingsTable";

export default function ConfigurationPage() {
  /*const {getRootProps, getInputProps} = useDropzone({
    // Implement file upload handling here
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        // Handle file upload here
        console.log(file);
      });
    }
  });*/


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
                  {/*<Card {...getRootProps()} className="col-span-7">
                    <CardHeader>
                      <CardTitle>
                        Import your origin users
                      </CardTitle>
                    </CardHeader>
                     <CardContent className="pl-2">
                      <input {...getInputProps()} />
                      <p>Drag 'n' drop some files here, or click to select files</p>
                    </CardContent>
                  </Card>*/}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="col-span-3">
                      <PlusCircledIcon className="mr-2 h-4 w-4" />
                        Add Linked Users
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56 ml-20" align="end" forceMount>
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <p className="mr-10">Add a new linked user</p>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Import your own linked users
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.81825 1.18188C7.64251 1.00615 7.35759 1.00615 7.18185 1.18188L4.18185 4.18188C4.00611 4.35762 4.00611 4.64254 4.18185 4.81828C4.35759 4.99401 4.64251 4.99401 4.81825 4.81828L7.05005 2.58648V9.49996C7.05005 9.74849 7.25152 9.94996 7.50005 9.94996C7.74858 9.94996 7.95005 9.74849 7.95005 9.49996V2.58648L10.1819 4.81828C10.3576 4.99401 10.6425 4.99401 10.8182 4.81828C10.994 4.64254 10.994 4.35762 10.8182 4.18188L7.81825 1.18188ZM2.5 9.99997C2.77614 9.99997 3 10.2238 3 10.5V12C3 12.5538 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2238 12.2239 9.99997 12.5 9.99997C12.7761 9.99997 13 10.2238 13 10.5V12C13 13.104 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2238 2.22386 9.99997 2.5 9.99997Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>                        </DropdownMenuItem>
                       
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
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
                    {/*<DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          defaultValue="Pedro Duarte"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
                        <Input
                          id="username"
                          defaultValue="@peduarte"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                </DialogFooter>*/}
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