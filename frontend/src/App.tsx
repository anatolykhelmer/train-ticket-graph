import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { emptyStateKind } from './api/empty-state';
import { GraphApiError } from './api/graph';
import type { ReactFlowGraph } from './api/types';
import { DetailsDrawer } from './components/DetailsDrawer';
import { EmptyState } from './components/EmptyState';
import { FilterToolbar } from './components/FilterToolbar';
import { GraphCanvas } from './components/GraphCanvas';
import { Legend } from './components/Legend';
import { useGraphFilters } from './hooks/use-graph-filters';
import { useGraphQuery } from './hooks/use-graph-query';

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  if (error instanceof GraphApiError) {
    return error.name === 'AbortError' || /abort/i.test(error.message);
  }
  return false;
}

export function App() {
  const { filters, setFilter, setAttackPath } = useGraphFilters();
  const query = useGraphQuery(filters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const lastGraphRef = useRef<ReactFlowGraph | undefined>(undefined);
  if (query.data) {
    lastGraphRef.current = query.data;
  }
  const graph = query.data ?? lastGraphRef.current;

  useEffect(() => {
    if (!query.error) {
      return;
    }
    if (isAbortError(query.error)) {
      return;
    }
    const message =
      query.error instanceof GraphApiError
        ? query.error.message
        : 'Failed to load graph';
    toast.error(message);
  }, [query.error]);

  const selected = graph?.nodes.find((node) => node.id === selectedId) ?? null;
  const emptyKind = graph ? emptyStateKind(filters, graph) : null;
  const showInitialSpinner = query.isPending && graph === undefined;

  return (
    <div className="app">
      <FilterToolbar
        filters={filters}
        nodeCount={graph?.nodes.length}
        edgeCount={graph?.edges.length}
        fetching={query.isFetching}
        onToggle={setFilter}
        onAttackPath={setAttackPath}
      />
      {emptyKind ? <EmptyState kind={emptyKind} /> : null}
      <div className="stage">
        {showInitialSpinner ? (
          <div className="stage-spinner" role="status">
            Loading…
          </div>
        ) : (
          <>
            <GraphCanvas
              nodes={graph?.nodes ?? []}
              edges={graph?.edges ?? []}
              selectedId={selectedId}
              onNodeSelect={setSelectedId}
              onPaneClick={() => setSelectedId(null)}
            />
            <Legend />
          </>
        )}
        {selected ? (
          <DetailsDrawer node={selected} onClose={() => setSelectedId(null)} />
        ) : null}
      </div>
    </div>
  );
}
