import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from 'posthog-js/react';
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/shared/data-table-faceted-filter";

import config from "@/lib/config";
import { AuthStrategy, providerToType, Provider, CONNECTORS_METADATA, extractProvider, extractVertical, needsSubdomain, needsScope, scopes } from "@panora/shared";
import useProjectStore from "@/state/projectStore";
import useConnectionStrategies from "@/hooks/get/useConnectionStrategies";
import useCreateConnectionStrategy from "@/hooks/create/useCreateConnectionStrategy";
import useUpdateConnectionStrategy from "@/hooks/update/useUpdateConnectionStrategy";
import useConnectionStrategyAuthCredentials from "@/hooks/get/useConnectionStrategyAuthCredentials";
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const formSchema = z.object({
  subdomain: z.string().optional(),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
  scope: z.string().optional(),
  api_key: z.string().optional(),
  username: z.string().optional(),
  secret: z.string().optional(),
});

interface ItemDisplayProps {
  item?: Provider;
}

export function ConnectorDisplay({ item }: ItemDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const { idProject } = useProjectStore();
  const queryClient = useQueryClient();
  const posthog = usePostHog();
  const [scopesOpen, setScopesOpen] = useState(false);

  const { data: connectionStrategies } = useConnectionStrategies();
  const { createCsPromise } = useCreateConnectionStrategy();
  const { updateCsPromise } = useUpdateConnectionStrategy();
  const { mutateAsync: fetchCredentials } = useConnectionStrategyAuthCredentials();
  const scopes = CONNECTORS_METADATA[item?.vertical!]?.[item?.name!]?.scopes?.split(' ') || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subdomain: "", client_id: "", client_secret: "", scope: "",
      api_key: "", username: "", secret: "",
    },
  });

  const mappingConnectionStrategies = connectionStrategies?.filter(
    (cs) => extractVertical(cs.type)?.toLowerCase() === item?.vertical?.toLowerCase() && 
    extractProvider(cs.type)?.toLowerCase() === item?.name?.toLowerCase()
  );

  const oauthAttributes = CONNECTORS_METADATA[item?.vertical!]?.[item?.name!]?.options?.oauth_attributes || [];

  useEffect(() => {
    oauthAttributes.forEach((attr: string) => {
      formSchema.shape[attr as keyof z.infer<typeof formSchema>] = z.string().optional();
    });
  }, [oauthAttributes]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${config.API_URL}/connections/oauth/callback`);
      setCopied(true);
      toast.success("Redirect URI copied");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { client_id, client_secret, scope, api_key, secret, username, subdomain } = values;
    const performUpdate = mappingConnectionStrategies && mappingConnectionStrategies.length > 0;
    const dynamicAttributes = oauthAttributes
    .map((attr: string) => values[attr as keyof z.infer<typeof formSchema>])
    .filter((value): value is string => value !== undefined);

    let attributes: string[] = [];
    let attributeValues: string[] = [];

    switch (item?.authStrategy.strategy) {
      case AuthStrategy.oauth2:
        if (!client_id || !client_secret) {
          form.setError("client_id", { message: "Please Enter Client ID" });
          form.setError("client_secret", { message: "Please Enter Client Secret" });
          return;
        }
        attributes = ["client_id", "client_secret", ...oauthAttributes];
        attributeValues = [client_id, client_secret, ...dynamicAttributes];
        
        if (needsSubdomain(item.name.toLowerCase(), item.vertical!.toLowerCase())) {
          if (!subdomain) {
            form.setError("subdomain", { message: "Please Enter Subdomain" });
            return;
          }
          attributes.push("subdomain");
          attributeValues.push(subdomain);
        }
        
        if (needsScope(item.name.toLowerCase(), item.vertical!.toLowerCase())) {
          if (!scope) {
            form.setError("scope", { message: "Please Enter the scope" });
            return;
          }
          attributes.push("scope");
          attributeValues.push(scope);
        }
        break;

      case AuthStrategy.api_key:
        if (!api_key) {
          form.setError("api_key", { message: "Please Enter API Key" });
          return;
        }
        attributes = ["api_key"];
        attributeValues = [api_key];
        break;

      case AuthStrategy.basic:
        if (!username || !secret) {
          form.setError("username", { message: "Please Enter Username" });
          form.setError("secret", { message: "Please Enter Secret" });
          return;
        }
        attributes = ["username", "secret"];
        attributeValues = [username, secret];
        break;
    }

    const promise = performUpdate
      ? updateCsPromise({
          id_cs: mappingConnectionStrategies[0].id_connection_strategy,
          updateToggle: false,
          status: mappingConnectionStrategies[0].status,
          attributes,
          values: attributeValues,
        })
      : createCsPromise({
          type: providerToType(item?.name!, item?.vertical!, item?.authStrategy.strategy!),
          attributes,
          values: attributeValues,
        });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: (data: any) => {
        queryClient.setQueryData<any[]>(
          ['connection-strategies'],
          (oldData = []) => performUpdate
            ? oldData.map(cs => cs.id_connection_strategy === data.id_connection_strategy ? data : cs)
            : [...oldData, data]
        );
        return "Changes saved successfully";
      },
      error: (err: any) => err.message || 'An error occurred',
    });

    posthog?.capture(`Connection_strategy_${item?.authStrategy.strategy}_${performUpdate ? 'updated' : 'created'}`, {
      id_project: idProject,
      mode: config.DISTRIBUTION
    });

    form.reset();
  }

  useEffect(() => {
    if (mappingConnectionStrategies && mappingConnectionStrategies.length > 0) {
      const attributes = 
        item?.authStrategy.strategy === AuthStrategy.oauth2
          ? [...(needsSubdomain(item.name.toLowerCase(), item.vertical!.toLowerCase()) ? ["subdomain"] : []),
             "client_id", "client_secret",
             ...(needsScope(item.name.toLowerCase(), item.vertical!.toLowerCase()) ? ["scope"] : []),
             ...oauthAttributes]
          : item?.authStrategy.strategy === AuthStrategy.api_key
          ? ["api_key"]
          : ["username", "secret"];

      fetchCredentials({ type: mappingConnectionStrategies[0].type, attributes }, {
        onSuccess(data) {
          let i = 0;
          if (item?.authStrategy.strategy === AuthStrategy.oauth2) {
            if (needsSubdomain(item.name.toLowerCase(), item.vertical?.toLowerCase()!)) {
              form.setValue("subdomain", data[i++]);
            }
            form.setValue("client_id", data[i++]);
            form.setValue("client_secret", data[i++]);
            if (needsScope(item.name.toLowerCase(), item.vertical?.toLowerCase()!)) {
              form.setValue("scope", data[i++]);
            }
            oauthAttributes.forEach((attr: string) => {
              form.setValue(attr as keyof z.infer<typeof formSchema>, data[i++]);
            });
          } else if (item?.authStrategy.strategy === AuthStrategy.api_key) {
            form.setValue("api_key", data[0]);
          } else if (item?.authStrategy.strategy === AuthStrategy.basic) {
            form.setValue("username", data[0]);
            form.setValue("secret", data[1]);
          }
          setSwitchEnabled(mappingConnectionStrategies[0].status === true);
        }
      });
    } else {
      form.reset();
      setSwitchEnabled(false);
    }
  }, [connectionStrategies, item]);

  const handleSwitchChange = (enabled: boolean) => {
    if (mappingConnectionStrategies && mappingConnectionStrategies.length > 0) {
      const dataToUpdate = mappingConnectionStrategies[0];
      toast.promise(
        updateCsPromise({
          id_cs: dataToUpdate.id_connection_strategy,
          updateToggle: true
        }),
        {
          loading: 'Updating status...',
          success: (data: any) => {
            queryClient.setQueryData<any[]>(['connection-strategies'], (oldData = []) =>
              oldData.map(cs => cs.id_connection_strategy === data.id_connection_strategy ? data : cs)
            );
            return "Status updated successfully";
          },
          error: (err: any) => err.message || 'An error occurred',
        }
      );
      setSwitchEnabled(enabled);
    }
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
                <div className="font-semibold">{`${item.name.substring(0, 1).toUpperCase()}${item.name.substring(1)}`}</div>
                <div className="line-clamp-1 text-xs">{item.description}</div>
                {mappingConnectionStrategies && mappingConnectionStrategies.length > 0 && (
                  <div className="line-clamp-1 text-xs mt-2">
                    <Label htmlFor="mute" className="flex items-center gap-2 text-xs font-normal">
                      <Switch
                        id="mute"
                        aria-label="Mute thread"
                        checked={switchEnabled}
                        onCheckedChange={handleSwitchChange}
                      />
                    </Label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {item.authStrategy.strategy === AuthStrategy.oauth2 && (
                  <>
                    {needsSubdomain(item.name.toLowerCase(), item.vertical!.toLowerCase()) && (
                      <FormField
                        name="subdomain"
                        control={form.control}
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>Subdomain</FormLabel>
                            <FormControl>
                              <PasswordInput {...field} placeholder="Enter Subdomain (such as https://my-zendesk.com)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      name="client_id"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <PasswordInput {...field} placeholder="Enter Client ID" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="client_secret"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <PasswordInput {...field} placeholder="Enter Client Secret" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                          name="scope"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Popover open={scopesOpen} onOpenChange={setScopesOpen}>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" onClick={() => setScopesOpen(true)}>
                                      Add Scopes
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                      <div className="space-y-2">
                                        {scopes.map((scope) => (
                                          <div key={scope} className="flex items-center">
                                            <Checkbox
                                              id={scope}
                                              checked={field.value?.includes(scope)}
                                              onCheckedChange={(checked) => {
                                                const updatedScopes = checked
                                                  ? [...(field.value?.split(' ') || []), scope]
                                                  : (field.value?.split(' ') || []).filter((s) => s !== scope);
                                                field.onChange(updatedScopes.join(' '));
                                              }}
                                            />
                                            <label htmlFor={scope} className="ml-2 text-sm">
                                              {scope}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                         )}
                        />

                    {oauthAttributes.map((attr: string) => (
                      <FormField
                        key={attr}
                        name={attr as keyof z.infer<typeof formSchema>}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{attr}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={`Enter ${attr}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <div className="flex flex-col">
                      <FormLabel>Redirect URI</FormLabel>
                      <div className="flex gap-2 mt-1">
                        <Input value={`${config.API_URL}/connections/oauth/callback`} readOnly />
                        <Button type="button" onClick={handleCopy}>
                          {copied ? 'Copied!' : (
                            <>
                              <p className="mr-1">Copy</p>
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                              </svg>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                {item.authStrategy.strategy === AuthStrategy.api_key && (
                  <FormField
                    name="api_key"
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <PasswordInput {...field} placeholder="Enter API Key" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {item.authStrategy.strategy === AuthStrategy.basic && (
                  <>
                    <FormField
                      name="username"
                      control={form.control}
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <PasswordInput {...field} placeholder="Enter Username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="secret"
                      control={form.control}
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Secret</FormLabel>
                          <FormControl>
                            <PasswordInput {...field} placeholder="Enter Secret" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <Button type="submit" size="sm" className="mt-4 h-7 gap-1">
                  Save
                </Button>
              </form>
            </Form>
          </div>
          <Separator className="mt-auto" />
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No connector selected
        </div>
      )}
    </div>
  );
}