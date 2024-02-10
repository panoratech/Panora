import { Button } from "../ui/button";
import ConnectionTable from "./ConnectionTable";
import { toast } from "sonner"

export default function ConnectionsPage() {
  return (
    <div className="flex items-center justify-between space-y-2">
    <div className="flex-1 space-y-4 p-8 pt-6">
    <div className="flex flex-col items-start justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">Connections</h2>
      <h2 className="text-lg font-bold tracking-tight">Connections between your product and your users’ accounts on third-party software.</h2>
      <Button
        variant="outline"
        onClick={() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        Show Toast
      </Button>
    </div>          
    <ConnectionTable />
    </div>
  </div>
  );
}