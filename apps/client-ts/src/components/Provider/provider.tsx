"use client"
import React, { ReactNode, useState } from "react"
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { StytchProvider, useStytchSession, useStytchUser } from "@stytch/nextjs"
import { createStytchUIClient } from '@stytch/nextjs/ui';
import { useRouter } from "next/router"

function Provider({ children }: any) {
  const client = new QueryClient();
  const stytch = createStytchUIClient(process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || '');
  return (
    <>
      <QueryClientProvider client={client}>
        <ReactQueryStreamedHydration>
            <StytchProvider stytch={stytch}>
                {children}
            </StytchProvider>
        </ReactQueryStreamedHydration>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
}

export { Provider }
