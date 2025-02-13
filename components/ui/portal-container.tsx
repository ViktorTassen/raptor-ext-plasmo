import React from "react"

export const PortalContext = React.createContext<HTMLElement | null>(null)

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null)

  return (
    <PortalContext.Provider value={container}>
      {children}
      <div ref={setContainer} className="plasmo-portal-container" />
    </PortalContext.Provider>
  )
}