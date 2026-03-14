'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type SetRightContent = (node: ReactNode) => void

const StoreSettingsHeaderContext = createContext<{
  rightContent: ReactNode
  setRightContent: SetRightContent
} | null>(null)

export function StoreSettingsHeaderProvider({ children }: { children: ReactNode }) {
  const [rightContent, setRightContentState] = useState<ReactNode>(null)
  const setRightContent = useCallback((node: ReactNode) => {
    setRightContentState(() => node)
  }, [])
  return (
    <StoreSettingsHeaderContext.Provider value={{ rightContent, setRightContent }}>
      {children}
    </StoreSettingsHeaderContext.Provider>
  )
}

export function useStoreSettingsHeader() {
  const ctx = useContext(StoreSettingsHeaderContext)
  return ctx
}
