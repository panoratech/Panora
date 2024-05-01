"use client"
import React, { ReactNode, useState } from "react"
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { useRouter } from "next/router"

function Provider({ children }: any) {
  const client = new QueryClient();
  return (
    <>
      <QueryClientProvider client={client}>
        <ReactQueryStreamedHydration>
                {children}
        </ReactQueryStreamedHydration>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
}

export { Provider }
