'use client';

import EventsTable from "@/components/Events/EventsTable";
import { Heading } from "@/components/ui/heading";
import { Suspense } from 'react'

export default function Page() {
    return (
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Heading
          title="Events"
          description=""
          />
        </div>   
        <Suspense>
          <EventsTable/>
        </Suspense>
        </div>
      </div>
    );
  }