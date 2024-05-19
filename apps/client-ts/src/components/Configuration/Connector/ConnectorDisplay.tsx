import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PasswordInput } from "@/components/ui/password-input"
import { z } from "zod"
import config from "@/lib/config"
import { AuthStrategy, providerToType, Provider, extractProvider, extractVertical } from "@panora/shared"
import { useEffect, useState } from "react"
import useProjectStore from "@/state/projectStore"
import useConnectionStrategyMutation from "@/hooks/mutations/useConnectionStrategy"
import useUpdateConnectionStrategyMutation from "@/hooks/mutations/useUpdateConnectionStrategy"
import useConnectionStrategyAuthCredentialsMutation from "@/hooks/mutations/useConnectionStrategyAuthCredentials"
import { usePostHog } from 'posthog-js/react'
import { Input } from "@/components/ui/input"
import useConnectionStrategies from "@/hooks/useConnectionStrategies"

interface ItemDisplayProps {
  item?: Provider 
}

const formSchema = z.object({
  client_id : z.string({
    required_error: "Please Enter a Client ID",
  }),
  client_secret : z.string({
    required_error: "Please Enter a Client Secret",
  }),
  scope : z.string({
    required_error: "Please Enter a scope",
  }),
  api_key: z.string({
    required_error: "Please Enter a API Key",
  }),
  username: z.string({
    required_error: "Please Enter Username",
  }),
  secret: z.string({
    required_error: "Please Enter Secret",
  }),
})

export function ConnectorDisplay({ item }: ItemDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const { idProject } = useProjectStore()
  const { data: connectionStrategies, isLoading: isConnectionStrategiesLoading, error: isConnectionStategiesError } = useConnectionStrategies()
  const { mutate: createCS } = useConnectionStrategyMutation();
  const { mutate: updateCS } = useUpdateConnectionStrategyMutation()
  const { mutateAsync: fetchCredentials, data: fetchedData } = useConnectionStrategyAuthCredentialsMutation();
  const posthog = usePostHog()

  const mappingConnectionStrategies = connectionStrategies?.filter((cs) => extractVertical(cs.type).toLowerCase() == item?.vertical && extractProvider(cs.type).toLowerCase() == item?.name)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: "",
      client_secret: "",
      scope: "",
      api_key: "",
      username: "",
      secret: "",
    },
  })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("localhost:3000/connections/oauth/callback")
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { client_id, client_secret, scope, api_key, secret, username } = values;
    const performUpdate = mappingConnectionStrategies && mappingConnectionStrategies.length > 0;
    switch (item?.authStrategy) {
      case AuthStrategy.oauth2:
        if (client_id === "" || client_secret === "" || scope === "") {
          if (client_id === "") {
            form.setError("client_id", { "message": "Please Enter Client ID" });
          }
          if (client_secret === "") {
            form.setError("client_secret", { "message": "Please Enter Client Secret" });
          }
          if (scope === "") {
            form.setError("scope", { "message": "Please Enter the scope" });
          }
          break;
        }
        if (performUpdate) {
          const dataToUpdate = mappingConnectionStrategies[0];
          updateCS({
            id_cs: dataToUpdate.id_connection_strategy,
            updateToggle: false,
            status: dataToUpdate.status,
            attributes: ["client_id", "client_secret", "scope"],
            values: [client_id, client_secret, scope]
          })
          posthog?.capture("Connection_strategy_OAuth2_updated", {
            id_project: idProject,
            mode: config.DISTRIBUTION
          });
        } else {
          createCS({
            projectId: idProject,
            type: providerToType(item?.name, item?.vertical!, AuthStrategy.oauth2),
            attributes: ["client_id", "client_secret", "scope"],
            values: [client_id, client_secret, scope]
          });
          posthog?.capture("Connection_strategy_OAuth2_created", {
            id_project: idProject,
            mode: config.DISTRIBUTION
          });
        }
        form.reset();
        console.log(values)
        break;

      case AuthStrategy.api_key:
        if (values.api_key === "") {
          form.setError("api_key", { "message": "Please Enter API Key" });
          break;
        }
        if (performUpdate) {
          const dataToUpdate = mappingConnectionStrategies[0];
          updateCS({
            id_cs: dataToUpdate.id_connection_strategy,
            updateToggle: false,
            status: dataToUpdate.status,
            attributes: ["api_key"],
            values: [api_key]
          })
          posthog?.capture("Connection_strategy_API_KEY_updated", {
            id_project: idProject,
            mode: config.DISTRIBUTION
          });
        } else {
          createCS({
            projectId: idProject,
            type: providerToType(item?.name, item?.vertical!, AuthStrategy.api_key),
            attributes: ["api_key"],
            values: [api_key]
          });
          posthog?.capture("Connection_strategy_API_KEY_created", {
            id_project: idProject,
            mode: config.DISTRIBUTION
          });
        }
        form.reset();
        console.log(values)
        break;

      case AuthStrategy.basic:
        if (values.username === "" || values.secret === "") {
          if (values.username === "") {
            form.setError("username", { "message": "Please Enter Username" });
          }
          if (values.secret === "") {
            form.setError("secret", { "message": "Please Enter Secret" });
          }
          break;
        }
        if (performUpdate) {
          const dataToUpdate = mappingConnectionStrategies[0];
          updateCS({
            id_cs: dataToUpdate.id_connection_strategy,
            updateToggle: false,
            status: dataToUpdate.status,
            attributes: ["username", "secret"],
            values: [username, secret]
          })
          posthog?.capture("Connection_strategy_BASIC_AUTH_updated", {
            id_project: idProject,
            mode: config.DISTRIBUTION
          });
        } else {
          createCS({
            projectId: idProject,
            type: providerToType(item?.name, item?.vertical!, AuthStrategy.basic),
            attributes: ["username", "secret"],
            values: [username, secret]
          });
          posthog?.capture("Connection_strategy_BASIC_AUTH_created", {
            id_project: idProject,
            mode: config.DISTRIBUTION
          });
        }
        form.reset();
        console.log(values)
        break;
    }
  }

  useEffect(() => {
    if (mappingConnectionStrategies && mappingConnectionStrategies.length > 0) {
      fetchCredentials({
        projectId: idProject,
        type: mappingConnectionStrategies[0].type,
        attributes: item?.authStrategy === AuthStrategy.oauth2 ? ["client_id", "client_secret", "scope"]
          : item?.authStrategy === AuthStrategy.api_key ? ["api_key"] : ["username", "secret"]
      }, {
        onSuccess(data) {
          if (item?.authStrategy === AuthStrategy.oauth2) {
            form.setValue("client_id", data[0]);
            form.setValue("client_secret", data[1]);
            form.setValue("scope", data[2]);
          }
          if (item?.authStrategy === AuthStrategy.api_key) {
            form.setValue("api_key", data[0]);
          }
          if (item?.authStrategy === AuthStrategy.basic) {
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
      updateCS({
        id_cs: dataToUpdate.id_connection_strategy,
        updateToggle: true
      });
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
              <img src={item.logoPath} className="w-8 h-8 rounded-lg" />
              <div className="grid gap-1">
                <div className="font-semibold">{`${item.name.substring(0, 1).toUpperCase()}${item.name.substring(1)}`}</div>
                <div className="line-clamp-1 text-xs">{item.description}</div>
                {mappingConnectionStrategies && mappingConnectionStrategies.length > 0 && (
                  <div className="line-clamp-1 text-xs mt-2">
                    <Label
                      htmlFor="mute"
                      className="flex items-center gap-2 text-xs font-normal"
                    >
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
                { item.authStrategy == AuthStrategy.oauth2 &&
                  <>
                    <div className="flex flex-col">
                      <FormField
                        name="client_id"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex flex-col">Client ID</FormLabel>
                            <FormControl>
                              <PasswordInput {...field} placeholder="Enter Client ID" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <FormField
                        name="client_secret"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex flex-col">Client Secret</FormLabel>
                            <FormControl>
                              <PasswordInput {...field} placeholder="Enter Client Secret" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <FormField
                        name="scope"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex flex-col">Scope</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter Scopes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <FormLabel className="flex flex-col">Redirect URI</FormLabel>
                      <div className="flex gap-2 mt-1">
                        <Input value="localhost:3000/connections/oauth/callback" readOnly />
                        <Button type="button" onClick={handleCopy}>
                          {copied ? 'Copied!' : (
                            <>
                              <p className="mr-1">Copy</p>
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </> 
                }
                {
                  item.authStrategy == AuthStrategy.api_key &&
                  <>
                    <div className="flex flex-col">
                        <FormField
                        name="api_key"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="flex flex-col">API Key</FormLabel>
                                <FormControl>
                                <PasswordInput {...field} placeholder="Enter API Key" />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />
                    </div>
                    </> 
                }
                {
                  item.authStrategy == AuthStrategy.basic &&
                    <>
                      <div className="flex flex-col">
                          <FormField
                          name="username"
                          control={form.control}
                          render={({field}) => (
                              <FormItem>
                                  <FormLabel className="flex flex-col">Username</FormLabel>
                                  <FormControl>
                                  <PasswordInput {...field} placeholder="Enter API Key" />
                                  </FormControl>
                                  <FormMessage/>
                              </FormItem>
                          )}
                          />
                      </div>
                      <div className="flex flex-col">
                          <FormField
                          name="secret"
                          control={form.control}
                          render={({field}) => (
                              <FormItem>
                                  <FormLabel className="flex flex-col">Secret</FormLabel>
                                  <FormControl>
                                  <PasswordInput {...field} placeholder="Enter API Key" />
                                  </FormControl>
                                  <FormMessage/>
                              </FormItem>
                          )}
                          />
                      </div>
                    </> 
                }
                <Button type="submit" className="mt-4">Save</Button>
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
  )
}
