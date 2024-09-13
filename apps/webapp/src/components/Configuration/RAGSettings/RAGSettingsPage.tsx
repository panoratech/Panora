import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from 'posthog-js/react';
import { toast } from "sonner";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import config from "@/lib/config";
import useProjectStore from "@/state/projectStore";
import useConnectionStrategies from "@/hooks/get/useConnectionStrategies";
import useCreateConnectionStrategy from "@/hooks/create/useCreateConnectionStrategy";
import useUpdateConnectionStrategy from "@/hooks/update/useUpdateConnectionStrategy";
import useConnectionStrategyAuthCredentials from "@/hooks/get/useConnectionStrategyAuthCredentials";
import Image from 'next/image';

const formSchema = z.object({
  vectorDatabase: z.string(),
  embeddingModel: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  url: z.string().optional(),
  indexName: z.string().optional(),
  embeddingApiKey: z.string().optional(),
});

export function RAGSettingsPage() {
  const { idProject } = useProjectStore();
  const queryClient = useQueryClient();
  const posthog = usePostHog();

  const { data: connectionStrategies } = useConnectionStrategies();
  const { createCsPromise } = useCreateConnectionStrategy();
  const { updateCsPromise } = useUpdateConnectionStrategy();
  const { mutateAsync: fetchCredentials } = useConnectionStrategyAuthCredentials();

  const [ragModeActive, setRagModeActive] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vectorDatabase: "",
      embeddingModel: "",
      apiKey: "",
      baseUrl: "",
      indexName: "",
      url: "",
      embeddingApiKey: "",
    },
  });
 
  const vectorDbConnectionStrategies = connectionStrategies?.filter(
    (cs) => cs.type.startsWith('vector_db.')
  ) || [];

  const embeddingModelConnectionStrategies = connectionStrategies?.filter(
    (cs) => cs.type.startsWith('embedding_model.')
  ) || [];

  useEffect(() => {
    const currentVectorDb = form.getValues().vectorDatabase;
    const currentEmbeddingModel = form.getValues().embeddingModel;

    const currentStrategy = vectorDbConnectionStrategies.find(
      cs => cs.type === `vector_db.${currentVectorDb}`
    );

    const embeddingModelStrategy = embeddingModelConnectionStrategies.find(
      cs => cs.type === `embedding_model.${currentEmbeddingModel}`
    );

    if (currentStrategy) {
      fetchCredentials({ type: currentStrategy.type, attributes: getAttributesForVectorDb(currentVectorDb) }, {
        onSuccess(data) {
          setFormValuesFromCredentials(currentVectorDb, data);
          setRagModeActive(currentStrategy.status === true);
        }
      });
    } else {
      // Reset form values for the fields specific to vector databases
      form.setValue("apiKey", "");
      form.setValue("baseUrl", "");
      form.setValue("url", "");
      form.setValue("indexName", "");
      setRagModeActive(false);
    }

    if (embeddingModelStrategy) {
      fetchCredentials({ type: embeddingModelStrategy.type, attributes: ['api_key'] }, {
        onSuccess(data) {
          form.setValue("embeddingApiKey", data[0]);
        }
      });
    } else {
      form.setValue("embeddingApiKey", "");
    }
  }, [form.watch("vectorDatabase"), form.watch("embeddingModel"), connectionStrategies]);

  const getAttributesForVectorDb = (vectorDb: string): string[] => {
    switch (vectorDb) {
      case 'turbopuffer':
        return ['api_key'];
      case 'pinecone':
        return ['api_key', 'index_name'];
      case 'qdrant':
        return ['api_key', 'base_url'];
      case 'chromadb':
        return ['url'];
      case 'weaviate':
        return ['api_key', 'url'];
      default:
        return [];
    }
  };

  const setFormValuesFromCredentials = (vectorDb: string, data: string[]) => {
    switch (vectorDb) {
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
        break;
      case 'chromadb':
        form.setValue("url", data[0]);
        break;
      case 'weaviate':
        form.setValue("apiKey", data[0]);
        form.setValue("url", data[1]);
        break;
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { vectorDatabase, apiKey, baseUrl, url, indexName, embeddingModel, embeddingApiKey } = values;
    const currentStrategy = vectorDbConnectionStrategies.find(
      cs => cs.type === `vector_db.${vectorDatabase}`
    );
    const currentEmbeddingModelStrategy = embeddingModelConnectionStrategies.find(
      cs => cs.type === `embedding_model.${embeddingModel}`
    );

    const performUpdate = !!currentStrategy;
    const performEmbeddingModelUpdate = !!currentEmbeddingModelStrategy;

    let attributes: string[] = [];
    let attributeValues: string[] = [];
    let embeddingModelAttributes: string[] = ['api_key'];
    let embeddingModelAttributeValues: string[] = [embeddingApiKey!];

    switch (vectorDatabase) {
      case 'turbopuffer':
        attributes = ['api_key'];
        attributeValues = [apiKey!];
        break;
      case 'pinecone':
        attributes = ['api_key', 'index_name'];
        attributeValues = [apiKey!, indexName!];
        break;
      case 'qdrant':
        attributes = ['api_key', 'base_url'];
        attributeValues = [apiKey!, baseUrl!];
        break;
      case 'chromadb':
        attributes = ['url'];
        attributeValues = [url!];
        break;
      case 'weaviate':
        attributes = ['api_key', 'url'];
        attributeValues = [apiKey!, url!];
        break;
    }

    const promise = performUpdate
      ? updateCsPromise({
          id_cs: currentStrategy!.id_connection_strategy,
          updateToggle: false,
          status: ragModeActive,
          attributes,
          values: attributeValues,
        })
      : createCsPromise({
          type: `vector_db.${vectorDatabase}`,
          attributes,
          values: attributeValues,
        });

    const embeddingModelPromise = performEmbeddingModelUpdate
      ? updateCsPromise({
          id_cs: currentEmbeddingModelStrategy!.id_connection_strategy,
          updateToggle: false,
          status: true,
          attributes: embeddingModelAttributes,
          values: embeddingModelAttributeValues,
        })
      : createCsPromise({
          type: `embedding_model.${embeddingModel}`,
          attributes: embeddingModelAttributes,
          values: embeddingModelAttributeValues,
        });

        toast.promise(Promise.all([promise, embeddingModelPromise]), {
          loading: 'Saving RAG settings...',
          success: () => {
            queryClient.invalidateQueries({ queryKey: ['connection-strategies'] });
            return "RAG settings saved successfully";
          },
          error: (err: any) => err.message || 'An error occurred',
        });

    posthog?.capture(`RAG_settings_${performUpdate ? 'updated' : 'created'}`, {
      id_project: idProject,
      vector_database: vectorDatabase,
      embedding_model: values.embeddingModel,
      mode: config.DISTRIBUTION
    });
  }

  const handleRagModeChange = (checked: boolean) => {
    setRagModeActive(checked);
  };

  const renderVectorDbInputs = () => {
      const vectorDatabase = form.watch("vectorDatabase");  
      switch (vectorDatabase) {
        case 'turbopuffer':
          return (
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter API Key"
                      className="bg-black text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        case 'pinecone':
          return (
            <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter API Key"
                      className="bg-black text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="indexName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Index Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter the index name (store name for embeddings) "
                      className="bg-black text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </>
          );
        case 'qdrant':
          return (
              <>
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter API Key"
                          className="bg-black text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baseUrl"
                  render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter Base URL"
                        className="bg-black text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
            />
          </>
        );
        case 'chromadb':
          return (
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter URL"
                      className="bg-black text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        case 'weaviate':
          return (
            <>
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter API Key"
                        className="bg-black text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter URL"
                        className="bg-black text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          );
        default:
          return null;
      }
  };

  const renderEmbeddingModelInputs = () => {
    const embeddingModel = form.watch("embeddingModel");
    if (embeddingModel === "OPENAI_ADA_SMALL_1536" || embeddingModel === "OPENAI_ADA_LARGE_3072" || embeddingModel === "OPENAI_ADA_002" || embeddingModel === "COHERE_MULTILINGUAL_V3") {
      return (
        <FormField
          control={form.control}
          name="embeddingApiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Enter API Key"
                  className="bg-black text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RAG Settings</CardTitle>
        <CardDescription>Configure your Retrieval-Augmented Generation settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="vectorDatabase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vector Database</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vector database" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
            <SelectItem value="pinecone">
              <div className="flex items-center">
                <Image src="/rag/pinecone.png" alt="Pinecone" width={20} height={20} className="mr-2 rounded-md" />
                Pinecone
              </div>
            </SelectItem>
            <SelectItem value="qdrant">
            <div className="flex items-center">
              <Image src="/rag/qdrant.png" alt="Pinecone" width={20} height={20} className="mr-2 rounded-md" />
              Qdrant
              </div>
            </SelectItem>
    
            <SelectItem value="weaviate">
            <div className="flex items-center">
              <Image src="/rag/weaviate.webp" alt="Pinecone" width={20} height={20} className="mr-2 rounded-md" />
              Weaviate
              </div>
            </SelectItem>
            
            <SelectItem value="chromadb">
            <div className="flex items-center">
              <Image src="/rag/chroma.webp" alt="ChromaDB" width={20} height={20} className="mr-2 rounded-md" />
              ChromaDb
              </div>
            </SelectItem>
            <SelectItem value="turbopuffer">
            <div className="flex items-center">
              <Image src="/rag/turbopuffer.png" alt="Turbopuffer" width={20} height={20} className="mr-2 rounded-md" />
              TurboPuffer
              </div>
            </SelectItem>
          </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          {renderVectorDbInputs()}

   
            <FormField
              control={form.control}
              name="embeddingModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embedding Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select embedding model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                <SelectItem value="OPENAI_ADA_SMALL_1536">
                <div className="flex items-center">
                <Image src="/rag/openai.jpg" alt="OpenAI" width={20} height={20} className="mr-2 rounded-md" />
                OpenAI - text-embedding-3-small
                </div>
                </SelectItem>
                <SelectItem value="OPENAI_ADA_LARGE_3072">
                <div className="flex items-center">
                <Image src="/rag/openai.jpg" alt="OpenAI" width={20} height={20} className="mr-2 rounded-md" />
                OpenAI - text-embedding-3-large
                </div>
                </SelectItem>
                <SelectItem value="OPENAI_ADA_002">
                <div className="flex items-center">
                <Image src="/rag/openai.jpg" alt="OpenAI" width={20} height={20} className="mr-2 rounded-md" />
                OpenAI - text-embedding-ada-002
                </div>
                </SelectItem>
                <SelectItem value="COHERE_MULTILINGUAL_V3">
                <div className="flex items-center">
                <Image src="/rag/cohere.jpeg" alt="Cohere" width={20} height={20} className="mr-2 rounded-md" />
                Cohere - embed-multilingual-v3.0
                </div>
                </SelectItem>
              </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderEmbeddingModelInputs()}

            <div className="flex items-center space-x-2">
              <Switch
                id="rag-mode"
                checked={ragModeActive}
                onCheckedChange={handleRagModeChange}
              />
              <Label htmlFor="rag-mode">Activate RAG Mode</Label>
            </div>

            <Button type="submit">Save RAG Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

