import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from 'posthog-js/react';
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import config from "@/lib/config";
import useProjectStore from "@/state/projectStore";
import useConnectionStrategies from "@/hooks/get/useConnectionStrategies";
import useCreateConnectionStrategy from "@/hooks/create/useCreateConnectionStrategy";
import useUpdateConnectionStrategy from "@/hooks/update/useUpdateConnectionStrategy";
import useConnectionStrategyAuthCredentials from "@/hooks/get/useConnectionStrategyAuthCredentials";
import { vectorDatabases, embeddingModels, TabType } from './utils';

const formSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  url: z.string().optional(),
  indexName: z.string().optional(),
  embeddingApiKey: z.string().optional(),
  collectionName: z.string().optional(),
  className: z.string().optional(),
});

interface ItemDisplayProps {
    item?: typeof vectorDatabases[number] | typeof embeddingModels[number];
    type: string;
}

export function RAGItemDisplay({ item, type }: ItemDisplayProps) {
    const [isActive, setIsActive] = useState(false);
    const { idProject } = useProjectStore();
    const queryClient = useQueryClient();
    const posthog = usePostHog();

    const { data: connectionStrategies } = useConnectionStrategies();
    const { createCsPromise } = useCreateConnectionStrategy();
    const { updateCsPromise } = useUpdateConnectionStrategy();
    const { mutateAsync: fetchCredentials } = useConnectionStrategyAuthCredentials();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            apiKey: "", baseUrl: "", url: "", indexName: "", embeddingApiKey: "",
        },
    });

    const currentStrategy = connectionStrategies?.find(
        (cs) => cs.type === `${type}.${item?.name.toLowerCase()}`
    );

    useEffect(() => {
        if (currentStrategy) {
            fetchCredentials({ type: currentStrategy.type, attributes: getAttributesForItem(item?.name) }, {
                onSuccess(data) {
                    setFormValuesFromCredentials(item?.name ?? '', data);
                    setIsActive(currentStrategy.status === true);
                }
            });
        } else {
            form.reset();
            setIsActive(false);
        }
    }, [connectionStrategies, item]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const attributes = getAttributesForItem(item?.name);
        const attributeValues = attributes.map(attr => values[attr as keyof typeof values]).filter((value): value is string => value !== undefined);
    
        const promise = currentStrategy
            ? updateCsPromise({
                id_cs: currentStrategy.id_connection_strategy,
                updateToggle: false,
                status: isActive,
                attributes,
                values: attributeValues,
            })
            : createCsPromise({
                type: `${type}.${item?.name.toLowerCase()}`,
                attributes,
                values: attributeValues,
                status: false,
            });
    
        toast.promise(promise, {
            loading: 'Saving changes...',
            success: (data: any) => {
                queryClient.setQueryData<any[]>(
                    ['connection-strategies'],
                    (oldData = []) => {
                        if (currentStrategy) {
                            return oldData.map(cs => 
                                cs.id_connection_strategy === data.id_connection_strategy 
                                    ? { ...data, status: isActive } // Ensure status matches isActive
                                    : cs
                            );
                        } else {
                            return [...oldData, { ...data, status: false }]; // New strategy is inactive
                        }
                    }
                );
                setIsActive(data.status);
                return "Changes saved successfully";
            },
            error: (err: any) => err.message || 'An error occurred',
        });
    
        posthog?.capture(`RAG_${type}_${currentStrategy ? 'updated' : 'created'}`, {
            id_project: idProject,
            item_name: item?.name,
            mode: config.DISTRIBUTION
        });
    }

    const handleActiveChange = (checked: boolean) => {
        if (currentStrategy) {
            const updatePromises = [];
    
            // Update current strategy
            updatePromises.push(
                toast.promise(
                    updateCsPromise({
                        id_cs: currentStrategy.id_connection_strategy,
                        updateToggle: true,
                        status: checked
                    }),
                    {
                        loading: `${checked ? 'Activating' : 'Deactivating'} ${item?.name}...`,
                        success: (data: any) => {
                            queryClient.setQueryData<any[]>(['connection-strategies'], (oldData = []) =>
                                oldData.map(cs => cs.id_connection_strategy === data.id_connection_strategy ? data : cs)
                            );
                            setIsActive(checked);
                            return `${item?.name} ${checked ? 'activated' : 'deactivated'} successfully`;
                        },
                        error: (err: any) => err.message || 'An error occurred',
                    }
                )
            );
    
            if (checked) {
                // Deactivate other items of the same type
                connectionStrategies?.forEach(cs => {
                    if (cs.type.startsWith(`${type}.`) && cs.type !== `${type}.${item?.name.toLowerCase()}` && cs.status) {
                        updatePromises.push(
                            toast.promise(
                                updateCsPromise({
                                    id_cs: cs.id_connection_strategy,
                                    updateToggle: true,
                                    status: false
                                }),
                                {
                                    loading: `Deactivating ${cs.type.split('.')[1]}...`,
                                    success: (data: any) => {
                                        queryClient.setQueryData<any[]>(['connection-strategies'], (oldData = []) =>
                                            oldData.map(strategy => strategy.id_connection_strategy === data.id_connection_strategy ? data : strategy)
                                        );
                                        return `${cs.type.split('.')[1]} deactivated successfully`;
                                    },
                                    error: (err: any) => err.message || 'An error occurred',
                                }
                            )
                        );
                    }
                });
            }
    
            // Wait for all updates to complete
            Promise.all(updatePromises).then(() => {
                queryClient.invalidateQueries({ queryKey: ['connection-strategies'] });
            });
        }
    };

    const getAttributesForItem = (itemName?: string): string[] => {
        switch (itemName?.toLowerCase()) {
            case 'turbopuffer':
                return ['apiKey'];
            case 'pinecone':
                return ['apiKey', 'indexName'];
            case 'qdrant':
                return ['apiKey', 'baseUrl', 'collectionName'];
            case 'chromadb':
                return ['url', 'collectionName'];
            case 'weaviate':
                return ['apiKey', 'url', 'className'];
            case 'openai_ada_small_1536':
            case 'openai_ada_large_3072':
            case 'openai_ada_002':
            case 'cohere_multilingual_v3':
                return ['embeddingApiKey'];
            default:
                return [];
        }
    };

    const setFormValuesFromCredentials = (itemName: string, data: string[]) => {
        switch (itemName?.toLowerCase()) {
            case 'turbopuffer':
                form.setValue("apiKey", data[0]);
                break;
            case 'pinecone':
                form.setValue("apiKey", data[0]);
                form.setValue("indexName", data[1]);
                break;
            case 'qdrant':
                form.setValue("apiKey", data[0]);
                form.setValue("baseUrl", data[1]);
                form.setValue("collectionName", data[1]);
                break;
            case 'chromadb':
                form.setValue("url", data[0]);
                form.setValue("collectionName", data[1]);
                break;
            case 'weaviate':
                form.setValue("apiKey", data[0]);
                form.setValue("url", data[1]);
                form.setValue("className", data[1]);
                break;
            case 'openai_ada_small_1536':
            case 'openai_ada_large_3072':
            case 'openai_ada_002':
            case 'cohere_multilingual_v3':
                form.setValue("embeddingApiKey", data[0]);
                break;
        }
    };

    const renderInputs = () => {
        const attributes = getAttributesForItem(item?.name);
        return attributes.map((attr) => (
            <FormField
                key={attr}
                control={form.control}
                name={attr as keyof z.infer<typeof formSchema>}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{attr}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                type={attr.toLowerCase().includes('key') ? 'password' : 'text'}
                                placeholder={`Enter ${attr}`}
                                className="bg-black text-white"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ));
    };

    return (
        <div className="flex h-full flex-col">
            <Separator />
            {item ? (
                <div className="flex flex-1 flex-col">
                    <div className="flex items-start p-4">
                        <div className="flex items-start gap-4 text-sm">
                            <img src={item.logoPath} className="w-8 h-8 rounded-lg" alt={item.name} />
                            <div className="grid gap-1">
                                <div className="font-semibold">{item.name}</div>
                                <div className="line-clamp-2 text-xs">{item.description}</div>
                                <div className="line-clamp-1 text-xs mt-2">
                                    <Switch
                                        checked={isActive}
                                        onCheckedChange={handleActiveChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex-1 p-4 text-sm">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {renderInputs()}
                                <Button type="submit" className='h-7' size={"sm"}>Save Changes</Button>
                            </form>
                        </Form>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    No item selected
                </div>
            )}
        </div>
    );
}