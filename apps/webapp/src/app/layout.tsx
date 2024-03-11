import React from "react"
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Panora',
  description: 'Unified API for integrations',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    )
}