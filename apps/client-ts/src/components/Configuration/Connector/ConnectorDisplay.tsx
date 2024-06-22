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
import { AuthStrategy, providerToType, Provider, extractProvider, extractVertical, needsSubdomain } from "@panora/shared"
import { useEffect, useState } from "react"
import useProjectStore from "@/state/projectStore"
import { usePostHog } from 'posthog-js/react'
import { Input } from "@/components/ui/input"
import useConnectionStrategies from "@/hooks/get/useConnectionStrategies"
import { DataTableFacetedFilter } from "@/components/shared/data-table-faceted-filter"
import useCreateConnectionStrategy from "@/hooks/create/useCreateConnectionStrategy"
import useUpdateConnectionStrategy from "@/hooks/update/useUpdateConnectionStrategy"
import useConnectionStrategyAuthCredentials from "@/hooks/get/useConnectionStrategyAuthCredentials"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ItemDisplayProps {
  item?: Provider 
}

const formSchema = z.object({
  subdomain: z.string({
    required_error: "Please Enter a Subdomain",
  }).optional(),
  client_id : z.string({
    required_error: "Please Enter a Client ID",
  }).optional(),
  client_secret : z.string({
    required_error: "Please Enter a Client Secret",
  }).optional(),
  scope : z.string({
    required_error: "Please Enter a scope",
  }).optional(),
  api_key: z.string({
    required_error: "Please Enter a API Key",
  }).optional(),
  username: z.string({
    required_error: "Please Enter Username",
  }).optional(),
  secret: z.string({
    required_error: "Please Enter Secret",
  }).optional(),
})

export function ConnectorDisplay({ item }: ItemDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const { idProject } = useProjectStore()
  const { data: connectionStrategies, isLoading: isConnectionStrategiesLoading, error: isConnectionStategiesError } = useConnectionStrategies()
  const { createCsPromise } = useCreateConnectionStrategy();
  const { updateCsPromise } = useUpdateConnectionStrategy()
  const { mutateAsync: fetchCredentials, data: fetchedData } = useConnectionStrategyAuthCredentials();
  const queryClient = useQueryClient();

  const posthog = usePostHog()

  const mappingConnectionStrategies = connectionStrategies?.filter((cs) => extractVertical(cs.type).toLowerCase() == item?.vertical && extractProvider(cs.type).toLowerCase() == item?.name)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subdomain: "",
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
      await navigator.clipboard.writeText(`${config.API_URL}/connections/oauth/callback`)
      setCopied(true);
      toast.success("Redirect uri copied", {
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      })
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { client_id, client_secret, scope, api_key, secret, username, subdomain } = values;
    const performUpdate = mappingConnectionStrategies && mappingConnectionStrategies.length > 0;
    switch (item?.authStrategy.strategy) {
      case AuthStrategy.oauth2:
        const needs_subdomain = needsSubdomain(item.name.toLowerCase(), item.vertical!.toLowerCase());
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
        if(needs_subdomain && subdomain == ""){
          form.setError("subdomain", { "message": "Please Enter Subdomain" });
        }
        let ATTRIBUTES = [];
        let VALUES = [];
        if(needs_subdomain){
          ATTRIBUTES = ["subdomain", "client_id", "client_secret", "scope"],
          VALUES = [subdomain!, client_id!, client_secret!, scope!]
        }else{
          ATTRIBUTES = ["client_id", "client_secret", "scope"],
          VALUES = [client_id!, client_secret!, scope!]
        }
        if (performUpdate) {
          const dataToUpdate = mappingConnectionStrategies[0];
          toast.promise(
            updateCsPromise({
              id_cs: dataToUpdate.id_connection_strategy,
              updateToggle: false,
              status: dataToUpdate.status,
              attributes: ATTRIBUTES,
              values: VALUES
            }), 
              {
              loading: 'Loading...',
              success: (data: any) => {
                queryClient.setQueryData<any[]>(['connection-strategies'], (oldQueryData = []) => {
                  return oldQueryData.map((CS) => CS.id_connection_strategy === data.id_connection_strategy ? data : CS)
                });
                return (
                    <div className="flex flex-row items-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    <div className="ml-2">
                        Changes have been saved
                    </div>
                    </div>
                )
                ;
              },
              error: (err: any) => err.message || 'Error'
          });
          posthog?.capture("Connection_strategy_OAuth2_updated", {
            id_project: idProject,
            mode: config.DISTRIBUTION
          });
        } else {
          toast.promise(
            createCsPromise({
              type: providerToType(item?.name, item?.vertical!, AuthStrategy.oauth2),
              attributes: ATTRIBUTES,
              values: VALUES
            }), 
              {
              loading: 'Loading...',
              success: (data: any) => {
                  queryClient.setQueryData<any[]>(['connections-strategies'], (oldQueryData = []) => {
                      return [...oldQueryData, data];
                  });
                  return (
                      <div className="flex flex-row items-center">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                      <div className="ml-2">
                          Changes have been saved
                      </div>
                      </div>
                  )
                  ;
              },
              error: (err: any) => err.message || 'Error'
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
          toast.promise(
            updateCsPromise({
              id_cs: dataToUpdate.id_connection_strategy,
              updateToggle: false,
              status: dataToUpdate.status,
              attributes: ["api_key"],
              values: [api_key!]
            }), 
              {
              loading: 'Loading...',
              success: (data: any) => {
                queryClient.setQueryData<any[]>(['connection-strategies'], (oldQueryData = []) => {
                  return oldQueryData.map((CS) => CS.id_connection_strategy === data.id_connection_strategy ? data : CS)
                });
                return (
                    <div className="flex flex-row items-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    <div className="ml-2">
                        Changes have been saved
                    </div>
                    </div>
                )
                ;
              },
              error: (err: any) => err.message || 'Error'
          });
          posthog?.capture("Connection_strategy_API_KEY_updated", {
            id_project: idProject,
            mode: config.DISTRIBUTION
          });
        } else {
          toast.promise(
            createCsPromise({
              type: providerToType(item?.name, item?.vertical!, AuthStrategy.api_key),
              attributes: ["api_key"],
              values: [api_key!]
            }), 
              {
              loading: 'Loading...',
              success: (data: any) => {
                  queryClient.setQueryData<any[]>(['connections-strategies'], (oldQueryData = []) => {
                      return [...oldQueryData, data];
                  });
                  return (
                      <div className="flex flex-row items-center">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                      <div className="ml-2">
                          Changes have been saved
                      </div>
                      </div>
                  )
                  ;
              },
              error: (err: any) => err.message || 'Error'
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
          toast.promise(
            updateCsPromise({
              id_cs: dataToUpdate.id_connection_strategy,
              updateToggle: false,
              status: dataToUpdate.status,
              attributes: ["username", "secret"],
              values: [username!, secret!]
            }), 
              {
              loading: 'Loading...',
              success: (data: any) => {
                queryClient.setQueryData<any[]>(['connection-strategies'], (oldQueryData = []) => {
                  return oldQueryData.map((CS) => CS.id_connection_strategy === data.id_connection_strategy ? data : CS)
                });
                return (
                    <div className="flex flex-row items-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    <div className="ml-2">
                        Changes have been saved
                    </div>
                    </div>
                )
                ;
              },
              error: (err: any) => err.message || 'Error'
          });
          posthog?.capture("Connection_strategy_BASIC_AUTH_updated", {
            id_project: idProject,
            mode: config.DISTRIBUTION
          });
          
        } else {
          toast.promise(
            createCsPromise({
              type: providerToType(item?.name, item?.vertical!, AuthStrategy.basic),
              attributes: ["username", "secret"],
              values: [username!, secret!]
            }), 
              {
              loading: 'Loading...',
              success: (data: any) => {
                  queryClient.setQueryData<any[]>(['connections-strategies'], (oldQueryData = []) => {
                      return [...oldQueryData, data];
                  });
                  return (
                      <div className="flex flex-row items-center">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                      <div className="ml-2">
                          Changes have been saved
                      </div>
                      </div>
                  )
                  ;
              },
              error: (err: any) => err.message || 'Error'
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
        type: mappingConnectionStrategies[0].type,
        attributes: item?.authStrategy.strategy === AuthStrategy.oauth2 ? needsSubdomain(item.name.toLowerCase(), item.vertical!.toLowerCase()) ? ["subdomain", "client_id", "client_secret", "scope"] : ["client_id", "client_secret", "scope"]
          : item?.authStrategy.strategy === AuthStrategy.api_key ? ["api_key"] : ["username", "secret"]
      }, {
        onSuccess(data) {
          if (item?.authStrategy.strategy === AuthStrategy.oauth2) {
            let i = 0;
            if(needsSubdomain(item.name.toLowerCase(), item.vertical!.toLowerCase())){
              form.setValue("subdomain", data[i]);
              i = 1;
            }
            form.setValue("client_id", data[i]);
            form.setValue("client_secret", data[i + 1]);
            form.setValue("scope", data[i + 2]);
          }
          if (item?.authStrategy.strategy === AuthStrategy.api_key) {
            form.setValue("api_key", data[0]);
          }
          if (item?.authStrategy.strategy === AuthStrategy.basic) {
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
          loading: 'Loading...',
          success: (data: any) => {
            queryClient.setQueryData<any[]>(['connection-strategies'], (oldQueryData = []) => {
              return oldQueryData.map((CS) => CS.id_connection_strategy === data.id_connection_strategy ? data : CS)
            });
            return (
                <div className="flex flex-row items-center">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                <div className="ml-2">
                    Changes have been saved
                </div>
                </div>
            )
            ;
          },
          error: (err: any) => err.message || 'Error'
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
                { item.authStrategy.strategy == AuthStrategy.oauth2 &&
                  <>
                  { needsSubdomain(item.name.toLowerCase(), item.vertical!.toLowerCase()) &&
                      <div className="flex flex-col">
                        <FormField
                        name="subdomain"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="flex flex-col">Subdomain</FormLabel>
                                <FormControl>
                                <PasswordInput {...field} placeholder="Enter Subdomain (such as https://my-zendesk.com)" />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />
                      </div>
                    }
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
                            <FormLabel className="flex flex-col">Scopes</FormLabel>
                            <FormControl>
                              <DataTableFacetedFilter title="Add" field={field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <FormLabel className="flex flex-col">Redirect URI</FormLabel>
                      <div className="flex gap-2 mt-1">
                        <Input value={`${config.API_URL}/connections/oauth/callback`} readOnly />
                        <Button type="button" onClick={handleCopy}>
                          {copied ? 'Copied!' : (
                            <>
                              <p className="mr-1">Copy</p>
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </> 
                }
                {
                  item.authStrategy.strategy == AuthStrategy.api_key &&
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
                  item.authStrategy.strategy == AuthStrategy.basic &&
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
                <Button type="submit" size="sm" className="mt-4 h-7 gap-1">Save</Button>
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
