'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const CopySnippet = () => {
    const [open,setOpen] = useState(false);
    const [copiedLeft, setCopiedLeft] = useState<boolean>(false);
    const [copiedRight, setCopiedRight] = useState<boolean>(false);

    const handleClick = () => {
        setOpen(true);
    }

    const handleCopyLeft = () => {
        navigator.clipboard.writeText(
            `<PanoraDynamicCatalogCard
                category={ConnectorCategory.Crm}
                projectId={"c9a1b1f8-466d-442d-a95e-11cdd00baf49"}
                returnUrl={"https://acme.inc"}
                linkedUserId={"b860d6c1-28f9-485c-86cd-fb09e60f10a2"}
            />`
        );
        toast.success("Code snippet copied", {
            action: {
              label: "Close",
              onClick: () => console.log("Close"),
            },
          })
        setCopiedLeft(true);
        setTimeout(() => {
            setCopiedLeft(false);
        }, 2000);
    };

    const handleCopyRight = () => {
        navigator.clipboard.writeText(
            `<PanoraProviderCard
            name={"hubspot"}
            category={ConnectorCategory.Crm}
            projectId={"c9a1b1f8-466d-442d-a95e-11cdd00baf49"}
            returnUrl={"https://acme.inc"}
            linkedUserId={"b860d6c1-28f9-485c-86cd-fb09e60f10a2"} 
          />`
        );
        toast.success("Code snippet copied", {
            action: {
              label: "Close",
              onClick: () => console.log("Close"),
            },
          })
        setCopiedRight(true);
        setTimeout(() => {
            setCopiedRight(false);
        }, 2000);
      };

    return (
        <>
        <Button 
            size="sm" 
            className="h-7 w-[150px] gap-1" 
            onClick={handleClick}
        >
            <span className="flex flex-row justify-center sr-only sm:not-sr-only sm:whitespace-nowrap">
            Copy Widget Code
            </span>
            <Copy className="h-3.5 w-3.5 mt-[3px] mr-1" />
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col w-[70vw] max-w-[1800px]">
        <DialogHeader>
          <DialogTitle>Import UI catalog components</DialogTitle>
          <DialogDescription>
            You can either import the whole catalog or import a specific connector! <a className='font-bold' href="https://docs.panora.dev/recipes/embed-catalog" target="_blank">More info in our docs.</a>
          </DialogDescription>
        </DialogHeader>
        <Card className="bg-zinc-900">
          <div className="flex w-full">
            <div className="flex flex-col gap-2 border-r px-2 py-4 w-1/2">
              <div className="px-4 text-sm font-medium">Import the whole catalog</div>
              <div className="grid gap-1">
                <code className="relative text-sm sm:text-base inline-flex text-left items-center space-x-4 bg-zinc-800 text-white rounded-lg p-2 pl-3 mt-4">
                    <div 
                        className="cursor-pointer absolute top-0 right-0" 
                        onClick={handleCopyLeft}
                    >
                        <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="secondary">{copiedLeft ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="15" height="15" fill="#ffffff">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                                    </svg>
                                    ) : (
                                    <>
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                        </svg>
                                    </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm">Copy</p>
                            </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <span className="flex flex-col gap-2">
                        <span className="flex-1">
                        <span>
                            {`<PanoraDynamicCatalogCard>`}
                        </span>
                        </span>
                        <span className="pl-4">
                            <span className="text-green-800">category</span>{`={ConnectorCategory.Crm}`}
                        </span>
                        <span className="pl-4">
                            <span className="text-cyan-600">projectId</span>{`={'c9a1b1f8-466d-442d-a95e-11cdd00baf49'}`}
                        </span>
                        <span className="pl-4">	
                            <span className="text-rose-600">returnUrl</span>{`={'https://acme.inc'}`}
                        </span>
                        <span className="pl-4">
                            <span className="text-amber-400">linkedUserId</span>{`={'b860d6c1-28f9-485c-86cd-fb09e60f10a2'}`}
                        </span> 
                        <span className="flex-1">
                        <span>
                            {`/>`}
                        </span>
                        </span>
                    </span>
                </code>
              </div>
            </div>
            <div className="flex flex-col gap-2 px-2 py-4 w-1/2">
              <div className="px-4 text-sm font-medium">Import Specific Connector</div>
              <div className="grid gap-1">
              <code className="relative rtext-sm sm:text-base inline-flex text-left items-center space-x-4 bg-zinc-800 text-white rounded-lg p-2 pl-3 mt-2">
                    <div 
                        className="cursor-pointer absolute top-0 right-0" 
                        onClick={handleCopyRight}
                    >
                        <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="secondary">{copiedRight ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="15" height="15" fill="#ffffff">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                                    </svg>
                                    ) : (
                                    <>
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                        </svg>
                                    </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm">Copy</p>
                            </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                  <span className="flex flex-col gap-2">
                    <span className="flex-1">
                      <span>
                        {`<PanoraProviderCard>`}
                      </span>
                    </span>
                    <span className="pl-4">
                      <span className="text-lime-500">name</span>{`={'hubspot'}`}
                    </span>
                    <span className="pl-4">
                        <span className="text-fuchsia-200">category</span>{`={ConnectorCategory.Crm}`}
                    </span>
                    <span className="pl-4">
                        <span className="text-cyan-600">projectId</span>{`={'c9a1b1f8-466d-442d-a95e-11cdd00baf49'}`}
                    </span>
                    <span className="pl-4">	
                        <span className="text-rose-600">returnUrl</span>{`={'https://acme.inc'}`}
                    </span>
                    <span className="pl-4">
                        <span className="text-amber-400">linkedUserId</span>{`={'b860d6c1-28f9-485c-86cd-fb09e60f10a2'}`}
                    </span> 
                    <span className="flex-1">
                      <span>
                        {`/>`}
                      </span>
                    </span>
                  </span>
                </code>
              </div>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>

        </>
        
    )
}