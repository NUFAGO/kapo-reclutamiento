
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { useState } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
// import { ConfirmProvider } from '@/context/confirm-context';
import { SidebarProvider } from '@/context/sidebar-context';
// import { PrecioSyncProvider } from '@/context/precio-sync-context';
import { QUERY_CONFIG } from '@/lib/constants';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: QUERY_CONFIG,
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* <ConfirmProvider> */}
          <AuthProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </AuthProvider>
        {/* </ConfirmProvider> */}
      </ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000, // Default duration for toasts that don't specify one
          style: {
            background: 'var(--card-bg)',
            color: 'var(--foreground)',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            borderRadius: '0.5rem',
            padding: '8px 12px',
          },
          success: {
            duration: 3000, // Default success duration (3s for updates, can be overridden)
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000, // Error duration (4s)
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {({ icon, message }) => (
              <>
                <span>{icon}</span>
                <span style={{ flex: 1, minWidth: 0 }}>{message}</span>
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: 'inherit', 
                      fontSize: '1rem',
                      padding: '0',
                      lineHeight: '1',
                      flexShrink: 0
                    }}
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </QueryClientProvider>
  );
}
