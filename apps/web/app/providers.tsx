"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { ClerkProvider } from "@clerk/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { CommandMenu } from "@/components/CommandMenu"
import { ProductHuntDialog } from "@/components/ProductHuntDialog"

import { initAmplitude } from "@/lib/amplitude"

const queryClient = new QueryClient()

export function AppProviders({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const isTagPage = pathname.startsWith("/s/")
  const isProPage = pathname.startsWith("/pro")
  const isTravelPrototype = pathname.startsWith("/travel")
  const showSidebar = isHomePage || isTagPage || isProPage

  useEffect(() => {
    if (!isTravelPrototype) initAmplitude()
  }, [isTravelPrototype])

  if (isTravelPrototype) {
    return <>{children}</>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider>
        <CommandMenu />
        <ProductHuntDialog />
        {showSidebar ? (
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        ) : (
          children
        )}
      </ClerkProvider>
    </QueryClientProvider>
  )
}
