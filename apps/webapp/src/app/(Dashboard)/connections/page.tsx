'use client';

import ConnectionTable from "@/components/Connection/ConnectionTable";
import { Heading } from "@/components/ui/heading";

export default function ConnectionPage() {
    return (
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col justify-between space-y-2">
          <Heading
          title="Connections"
          description="Connections between your product and your users’ accounts on third-party software."
          />
        </div>
        <></>
        <ConnectionTable />
        </div>
      </div>
      
    );
} 