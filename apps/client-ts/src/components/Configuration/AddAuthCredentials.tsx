'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import useProjectStore from "@/state/projectStore"

import { cn } from "@/lib/utils"

import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
// import { toast } from "@/components/ui/use-toast"

import AddAuthCredentialsForm from "./AddAuthCredentialsForm"

const sampleData = {
    "provider_name": "Zoho",
    "auth_type": "Basic_Auth",
    "activate": false,
    "credentials": {
      "username": "dsdsdsdsdsd",
      "secret": "dddsddsdsdsdsdsdd",
    },
    "action": "sas",
    "logoPath": 'https://assets-global.website-files.com/64f68d43d25e5962af5f82dd/64f68d43d25e5962af5f9812_64ad8bbe47c78358489b29fc_645e3ccf636a8d659f320e25_Group%25252012.png',
 
}



const AddAuthCredentials = () => {
    const [open, setOpen] = useState(false);
    


    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        // form.reset()
      };

    
    //const [secret, setSecret] = useState('');
    const posthog = usePostHog()

    const {idProject} = useProjectStore();

    


    

    // const Watch = form.watch()

    
   
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-[210px] justify-between")}
            onClick={ () => {
                posthog?.capture("add_webhook_button_clicked", {
                    id_project: idProject,
                    mode: config.DISTRIBUTION
                })
            }}
          >
            <PlusCircledIcon className=" h-5 w-5" />
            Add 0Auth Credentials
        </Button>
        </DialogTrigger>
        <DialogContent className="sm:w-[450px] lg:max-w-screen-lg overflow-y-scroll max-h-screen">
            <AddAuthCredentialsForm />
        </DialogContent>
    </Dialog>   
  )
}

export default AddAuthCredentials;