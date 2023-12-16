import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,

  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import useProjectStore from "@/state/projectStore"
import useWebhookMutation from "@/hooks/mutations/useWebhookMutation"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { scopes } from "shared-types"
import { cn } from "@/lib/utils"


const AddWebhook = () => {
    const [open, setOpen] = useState(false);
    const handleClose = () => {
      setOpen(false);
    };
    const [url, setUrl] = useState('');
    const [scope, setScope] = useState('');
    //const [secret, setSecret] = useState('');
    const [description, setDescription] = useState('');

    const {idProject} = useProjectStore();

    const { mutate } = useWebhookMutation();


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission
        mutate({ 
            url: url,
            description: description,
            id_project: idProject,
            scope: scope,
        });
        handleClose();  
    };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-[160px] justify-between")}
          >
            <PlusCircledIcon className=" h-5 w-5" />
            Add Webhook
        </Button>
        </DialogTrigger>
        <DialogContent className="sm:w-[450px]">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Define your webhook</CardTitle>
                    <CardDescription>
                    React to specific events in your product.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="event">Event</Label>
                        <Select 
                            defaultValue={scopes[0]}
                            value={scope}
                            onValueChange={setScope}
                        >
                        <SelectTrigger id="event">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                scopes.map((scope)=> {
                                    return (
                                        <SelectItem value={scope}>{scope}</SelectItem>
                                    )
                                })
                            }
                        </SelectContent>
                        </Select>
                    </div>
            
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="url">Destination Url</Label>
                    <Input
                        id="url"
                        placeholder="https://localhost/my-endpoint/webhook"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        placeholder="Please include a description of your endpoint."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    </div>
                </CardContent>
                <CardFooter className="justify-between space-x-2">
                    <Button type="submit">Submit</Button>
                </CardFooter>
            </form>
        </DialogContent>
    </Dialog>   
  )
}

export default AddWebhook;