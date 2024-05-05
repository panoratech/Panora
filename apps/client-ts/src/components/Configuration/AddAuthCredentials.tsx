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

import AddAuthCredentialsForm from "./AddAuthCredentialsForm"

const AddAuthCredentials = () => {
  const [open, setOpen] = useState(false);
  const posthog = usePostHog()
  const {idProject} = useProjectStore();

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    // form.reset()
  };

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
            Add Custom OAuth
        </Button>
        </DialogTrigger>
        <DialogContent className="sm:w-[450px] lg:max-w-screen-lg overflow-y-scroll max-h-screen">
            <AddAuthCredentialsForm performUpdate={false} closeDialog={() => setOpen(false)} />
        </DialogContent>
    </Dialog>   
  )
}

export default AddAuthCredentials;