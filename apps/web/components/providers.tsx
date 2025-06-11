'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamically import the WalletProvider to avoid SSR issues with wallet adapter
const WalletContextProvider = dynamic(
  () => import('./blockchain/WalletProvider'),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <WalletContextProvider>
          {children}
          <Toaster position='top-right' />
        </WalletContextProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
