import type { GraphFilters, ReactFlowGraph } from './types';

export type EmptyStateKind = 'attack-path' | 'filters' | 'none';

export const EMPTY_STATE_TITLE: Record<EmptyStateKind, string> = {
  'attack-path': 'No matching routes.',
  filters: 'No matching routes for the current filters.',
  none: 'No nodes returned.',
};

export const EMPTY_STATE_COPY: Record<EmptyStateKind, string | null> = {
  'attack-path':
    'On this dataset no directed path goes from a public node to RDS. Public services only reach a small cluster; prod-postgresdb is fed by auth-service and order-service, which are not reachable from the frontend.',
  filters: null,
  none: null,
};

export function emptyStateKind(
  filters: GraphFilters,
  graph: ReactFlowGraph,
): EmptyStateKind | null {
  if (graph.nodes.length > 0 || graph.edges.length > 0) {
    return null;
  }
  if (filters.fromPublic && filters.toSink) {
    return 'attack-path';
  }
  if (filters.fromPublic || filters.toSink || filters.hasVulnerability) {
    return 'filters';
  }
  return 'none';
}
