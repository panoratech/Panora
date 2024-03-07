'use client';

import EventsTable from "@/components/Events/EventsTable";
import { Suspense } from 'react'

export default function Page() {
    return (
      <div className="flex items-center justify-between space-y-2">
        <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Logs</h2>
        </div>   
          <Suspense>
            <EventsTable/>
          </Suspense>
        </div>
      </div>
    );
  }