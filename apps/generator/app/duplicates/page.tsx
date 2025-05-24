'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PepeList from './components/PepeList';

const queryClient = new QueryClient();

export default async function DuplicatesPage() {
  return (
    <main style={{ margin: '64px 0 0 0' }}>
      <QueryClientProvider client={queryClient}>
        <PepeList />
      </QueryClientProvider>
    </main>
  );
}
