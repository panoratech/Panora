import "./global.css";
import PanoraIntegrationCard from "./components/PanoraIntegrationCard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PanoraDynamicCatalog from "./components/PanoraDynamicCatalog";

interface ProviderCardProp {
  name: string;
  vertical: string;
  projectId: string;
  returnUrl: string;
  linkedUserId: string;
  optionalApiUrl?: string,
}

interface DynamicCardProp {
  // name: string;
  // vertical: string;
  projectId: string;
  returnUrl: string;
  linkedUserId: string;
  optionalApiUrl?: string,
}

const PanoraProviderCard = ({name, vertical, projectId, returnUrl, linkedUserId, optionalApiUrl}: ProviderCardProp) => {
    const queryClient = new QueryClient();
    return (
      <QueryClientProvider client={queryClient}>
          <PanoraIntegrationCard name={name} vertical={vertical} projectId={projectId} returnUrl={returnUrl} linkedUserId={linkedUserId} optionalApiUrl={optionalApiUrl}  />
      </QueryClientProvider>
    )
}

const PanoraDynamicCatalogCard = ({projectId,returnUrl,linkedUserId,optionalApiUrl} : DynamicCardProp) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
        <PanoraDynamicCatalog  projectId={projectId} returnUrl={returnUrl} linkedUserId={linkedUserId} optionalApiUrl={optionalApiUrl}  />
    </QueryClientProvider>
  )

}


  
export {PanoraProviderCard,PanoraDynamicCatalogCard};
