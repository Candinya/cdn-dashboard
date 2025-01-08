import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClientAtom } from 'jotai-tanstack-query';
import { Provider } from 'jotai/react';
import { useHydrateAtoms } from 'jotai/react/utils';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Router } from './Router';
import { theme } from './theme';

const queryClient = new QueryClient();

const HydrateAtoms = ({ children }: PropsWithChildren) => {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
};

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications />
        <QueryClientProvider client={queryClient}>
          <Provider>
            <HydrateAtoms>
              <Router />
            </HydrateAtoms>
          </Provider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}
