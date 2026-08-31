import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchGraph, GraphApiError } from '../api/graph';
import type { GraphFilters } from '../api/types';

export function useGraphQuery(filters: GraphFilters) {
  return useQuery({
    queryKey: ['graph', filters],
    queryFn: ({ signal }) => fetchGraph(filters, { signal }),
    placeholderData: keepPreviousData,
    retryDelay: 0,
    retry: (failureCount, error) => {
      if (
        error instanceof GraphApiError &&
        error.kind === 'http' &&
        error.status === 400
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
