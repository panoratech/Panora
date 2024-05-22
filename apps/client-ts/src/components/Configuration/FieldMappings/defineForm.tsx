/* eslint-disable react/no-unescaped-entities */
'use client'

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useMapField from "@/hooks/create/useMapField"
import { useEffect, useState } from "react"
import useFieldMappings from "@/hooks/get/useFieldMappings"
import useProviderProperties from "@/hooks/get/useProviderProperties"
import { standardObjects } from "@panora/shared";
import useProjectStore from "@/state/projectStore"
import useLinkedUsers from "@/hooks/get/useLinkedUsers"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
import { CRM_PROVIDERS } from "@panora/shared"
import useDefineField from "@/hooks/create/useDefineField"


const defineFormSchema = z.object({
  standardModel: z.string().min(2, {
    message: "standardModel must be at least 2 characters.",
  }),
  fieldName: z.string().min(2, {
    message: "fieldName must be at least 2 characters.",
  }),
  fieldDescription: z.string().min(2, {
    message: "fieldDescription must be at least 2 characters.",
  }),
  fieldType: z.string().min(2, {
    message: "fieldType must be at least 2 characters.",
  }),
})


export function DefineForm({ onClose }: {onClose: () => void}) {

  const defineForm = useForm<z.infer<typeof defineFormSchema>>({
    resolver: zodResolver(defineFormSchema),
    defaultValues: {
      standardModel: "",
      fieldName: "",
      fieldDescription: "",
      fieldType: "",
    },
  })

  const {idProject} = useProjectStore();

  const { data: mappings } = useFieldMappings();
  const { mutate: mutateDefineField } = useDefineField();

  
  const posthog = usePostHog()


  function onDefineSubmit(values: z.infer<typeof defineFormSchema>) {
    console.log(values)
    mutateDefineField({
      object_type_owner: values.standardModel,
      name: values.fieldName,
      description: values.fieldDescription,
      data_type: values.fieldType,
    });
    posthog?.capture("field_defined", {
      id_project: idProject,
      mode: config.DISTRIBUTION
    })
    onClose();
  }
  return (
    <Form {...defineForm}>
    <form onSubmit={defineForm.handleSubmit(onDefineSubmit)}>
        <CardHeader>
        <CardTitle>Define a custom field</CardTitle>
        <CardDescription>
            Create a custom field in Panora to extend our unified objects. Once done, you can map this field to existing fields in your end-user's software. Find details in
            <a href="https://docs.panora.dev/core-concepts/custom-fields" target="_blank" rel="noopener noreferrer"><strong> documentation</strong></a>.
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
        <div className="space-y-1">
        <FormField
                control={defineForm.control}
                name="standardModel"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>What object to you want to extend?</FormLabel>
                    <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value} >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select an object" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        {standardObjects && standardObjects
                            .map((sObject: string) => (
                            <SelectItem key={sObject} value={sObject}>{sObject}</SelectItem>
                            ))
                        }
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="space-y-1">
            <FormField
                control={defineForm.control}
                name="fieldName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Give your Custom Field an identifier</FormLabel>
                    <FormControl>
                    <Input 
                        placeholder="ex: hair_color, or lead_score" {...field} 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="space-y-1">
            <FormField
                control={defineForm.control}
                name="fieldDescription"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                    <Input 
                        placeholder="My customer's favorite color" {...field} 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="space-y-1">
            <FormField
                control={defineForm.control}
                name="fieldType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Data Type</FormLabel>
                    <FormControl>
                    <Select
                    onValueChange={field.onChange} defaultValue={field.value}
                    >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="string">Text</SelectItem>
                        <SelectItem value="int">Number</SelectItem>
                        <SelectItem value="string[]">Text Array</SelectItem>
                        <SelectItem value="int[]">Number Array</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        </CardContent>
        <CardFooter>
        <Button size="sm" className="h-7 gap-1 w-full" >Create Field</Button>
        </CardFooter>
    </form>
    </Form>
  )
}
        