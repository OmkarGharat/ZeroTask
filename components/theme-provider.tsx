'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

import { SWRConfig } from 'swr'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <SWRConfig value={{ revalidateOnFocus: false, dedupingInterval: 10000 }}>
        {children}
      </SWRConfig>
    </NextThemesProvider>
  )
}
