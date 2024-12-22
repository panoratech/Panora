'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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
                optionalApiUrl={"https://acme.inc"}
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
            optionalApiUrl={"https://acme.inc"}
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
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader className="space-y-4">
                    <DialogTitle className="text-2xl">Catalog Widget Code</DialogTitle>
                    <DialogDescription className="text-base flex items-center gap-2">
                        Choose between importing the complete catalog or a specific connector
                        <a 
                            href="https://docs.panora.dev/recipes/embed-catalog" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                            Learn more in our docs
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Complete Catalog Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Complete Catalog</h3>
                            <p className="text-sm text-muted-foreground">
                                Import all available connectors with a single component
                            </p>
                        </div>
                        <Card className="relative bg-zinc-950 p-4">
                            <Button
                                size="sm"
                                variant="outline"
                                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white hover:bg-zinc-100 border-zinc-200"
                                onClick={handleCopyLeft}
                            >
                                {copiedLeft ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="15" height="15" fill="currentColor">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                                    </svg>
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                            <pre className="text-sm text-white overflow-x-auto p-2">
                                <code className="grid gap-2">
                                    <span>{`<PanoraDynamicCatalogCard`}</span>
                                    <span className="pl-4"><span className="text-green-400">category</span>{`={ConnectorCategory.Crm}`}</span>
                                    <span className="pl-4"><span className="text-blue-400">projectId</span>{`={"c9a1b1f8-466d-442d-a95e-11cdd00baf49"}`}</span>
                                    <span className="pl-4"><span className="text-rose-400">optionalApiUrl</span>{`={"https://acme.inc"}`}</span>
                                    <span className="pl-4"><span className="text-yellow-400">linkedUserId</span>{`={"b860d6c1-28f9-485c-86cd-fb09e60f10a2"}`}</span>
                                    <span>{`/>`}</span>
                                </code>
                            </pre>
                        </Card>
                    </div>

                    {/* Specific Connector Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Specific Connector</h3>
                            <p className="text-sm text-muted-foreground">
                                Import a single connector with customizable properties
                            </p>
                        </div>
                        <Card className="relative bg-zinc-950 p-4">
                            <Button
                                size="sm"
                                variant="outline"
                                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white hover:bg-zinc-100 border-zinc-200"
                                onClick={handleCopyRight}
                            >
                                {copiedRight ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="15" height="15" fill="currentColor">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                                    </svg>
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                            <pre className="text-sm text-white overflow-x-auto p-2">
                                <code className="grid gap-2">
                                    <span>{`<PanoraProviderCard`}</span>
                                    <span className="pl-4"><span className="text-green-400">name</span>{`={"hubspot"}`}</span>
                                    <span className="pl-4"><span className="text-blue-400">category</span>{`={ConnectorCategory.Crm}`}</span>
                                    <span className="pl-4"><span className="text-rose-400">projectId</span>{`={"c9a1b1f8-466d-442d-a95e-11cdd00baf49"}`}</span>
                                    <span className="pl-4"><span className="text-yellow-400">optionalApiUrl</span>{`={"https://acme.inc"}`}</span>
                                    <span className="pl-4"><span className="text-purple-400">linkedUserId</span>{`={"b860d6c1-28f9-485c-86cd-fb09e60f10a2"}`}</span>
                                    <span>{`/>`}</span>
                                </code>
                            </pre>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}