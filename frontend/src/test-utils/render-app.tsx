import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import { Toaster } from 'sonner';
import { App } from '../App';

export function renderApp(): RenderResult {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <App />
      <Toaster />
    </QueryClientProvider>,
  );
}
