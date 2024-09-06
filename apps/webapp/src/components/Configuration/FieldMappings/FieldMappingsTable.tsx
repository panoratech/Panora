import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "@/components/shared/data-table";
import { useColumns } from "./columns";
import { DataTableLoading } from "@/components/shared/data-table-loading";
import { Button } from "@/components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { usePostHog } from "posthog-js/react";
import useProjectStore from "@/state/projectStore";
import config from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DefineForm } from "./defineForm";
import { useState } from "react";
import { MapForm } from "./mapForm";
import StepperForm from "./Stepper/stepper-form";
export interface Mapping {
  standard_object: string; 
  source_app: string; 
  status: string;  
  category: string; 
  source_field: string;
  destination_field: string;
  data_type: string;
}

export default function FieldMappingsTable({
  mappings,
  isLoading 
}: { mappings: Mapping[] | undefined; isLoading: boolean }) {
  const [defineOpen, setDefineOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [stepperClose, setStepperClose] = useState(true);

  const columns =  useColumns();
  const handleDefineClose = () => {
    setDefineOpen(false);
  };
  const handleMapClose = () => {
    setMapOpen(false);
  };
  const posthog = usePostHog()
  const {idProject} = useProjectStore();

  const countDefined = mappings?.filter(mapping => mapping.status === "defined").length;
  const countMapped = mappings?.filter(mapping => mapping.status === "mapped").length;

  const handleStepper = () => {
    setStepperClose(false);
  }
  const handleStepperClose = () => {
		setStepperClose(true); 
	};

  if(isLoading){
    return <DataTableLoading data={[]} columns={columns}/>;
  }

  return (
    <>
    {
      stepperClose ? 
        <Button 
        size="sm" 
        className="h-7 gap-1 mb-4" 
        onClick={handleStepper}
        >
            <span className="flex flex-row justify-center sr-only sm:not-sr-only sm:whitespace-nowrap mx-4">
            <PlusCircledIcon className="h-3.5 w-3.5 mt-[3px] mr-1" />
            Add Field Mappings
            </span>
      </Button>
      : <StepperForm setClose={handleStepperClose}/>
    }
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
      <div className="flex items-center space-x-4 justify-between flex-row">
      <Card className="relative w-1/2">
          <CardHeader>
              <CardTitle>Defined</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-4xl font-bold">{countDefined}</p>
          </CardContent>
            <Dialog open={defineOpen} onOpenChange={setDefineOpen}>
            <DialogTrigger asChild>
              <Button 
                  size="sm" 
                  className="absolute bottom-0 right-0 mb-2 mr-2 h-7 gap-1 w-[180px]" // Adjusted classes
                  onClick={() => {
                      posthog?.capture("add_field_mappings_button_clicked", {
                          id_project: idProject,
                          mode: config.DISTRIBUTION
                      })
                  }}
              >
                  <span className="flex flex-row justify-center sr-only sm:not-sr-only sm:whitespace-nowrap">
                      <PlusCircledIcon className="h-3.5 w-3.5 mt-[3px] mr-1" />
                      Define a custom field
                  </span>
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:w-[450px] lg:max-w-screen-lg overflow-y-scroll max-h-screen">
            <DefineForm onClose={handleDefineClose}/>
          </DialogContent>
          </Dialog>
        </Card>
        <Card className="relative w-1/2">
            <CardHeader>
                <CardTitle>Mapped</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{countMapped}</p>
            </CardContent>
            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
            <DialogTrigger asChild>
              <Button 
                  size="sm" 
                  className="absolute bottom-0 right-0 mb-2 mr-2 h-7 gap-1 w-[180px]"
                  onClick={() => {
                      posthog?.capture("map_field_mappings_button_clicked", {
                          id_project: idProject,
                          mode: config.DISTRIBUTION
                      })
                  }}
              >
                  <span className="flex flex-row justify-center sr-only sm:not-sr-only sm:whitespace-nowrap">
                      <PlusCircledIcon className="h-3.5 w-3.5 mt-[3px] mr-1" />
                      Map a custom field
                  </span>
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:w-[450px] lg:max-w-screen-lg overflow-y-scroll max-h-screen">
            <MapForm onClose={handleMapClose}/>
          </DialogContent>
          </Dialog>
        </Card>                  
        </div>
        {mappings && <DataTable data={mappings} columns={columns} />}
      </div>
    </>
  )
}