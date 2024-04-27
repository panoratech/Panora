'use client';

import ConnectionTable from "@/components/Connection/ConnectionTable";

export default function ConnectionPage() {
    return (
      <div className="flex flex-col items-center justify-between space-y-2 w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Connections</h2>
          <h2 className="text-lg font-bold tracking-tight">Connections between your product and your users’ accounts on third-party software.</h2>
        </div>         
        <ConnectionTable />
        </div>
      </div>
      
    );
} 