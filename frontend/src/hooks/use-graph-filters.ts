import { useCallback, useState } from 'react';
import { attackPathFilters, graphFiltersToSearch, parseGraphFilters } from '../api/filters';
import type { FilterName, GraphFilters } from '../api/types';

function readFilters(): GraphFilters {
  return parseGraphFilters(window.location.search);
}

function writeFilters(filters: GraphFilters): void {
  const next = `${window.location.pathname}${graphFiltersToSearch(filters)}`;
  window.history.replaceState(null, '', next);
}

export function useGraphFilters(): {
  filters: GraphFilters;
  setFilter: (name: FilterName, value: boolean) => void;
  setAttackPath: () => void;
} {
  const [filters, setFilters] = useState<GraphFilters>(readFilters);

  const commit = useCallback((next: GraphFilters) => {
    writeFilters(next);
    setFilters(next);
  }, []);

  const setFilter = useCallback((name: FilterName, value: boolean) => {
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      writeFilters(next);
      return next;
    });
  }, []);

  const setAttackPath = useCallback(() => {
    commit(attackPathFilters());
  }, [commit]);

  return { filters, setFilter, setAttackPath };
}
