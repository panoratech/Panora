//'use client';

import DiscoveryClient from "@/components/Auth/DiscoveryClient";
import DiscoveryServer from "@/components/Auth/DiscoveryServer";

const Page = async () => {
  return (
    <DiscoveryClient>
      <DiscoveryServer />
    </DiscoveryClient>
  )
};

export default Page;
