import { graphFiltersToSearch } from './filters';
import type { GraphFilters, ReactFlowGraph } from './types';

export function apiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
}

export class GraphApiError extends Error {
  readonly kind: 'http' | 'network';
  readonly status?: number;

  constructor(message: string, kind: 'http' | 'network', status?: number) {
    super(message);
    this.name = 'GraphApiError';
    this.kind = kind;
    this.status = status;
  }
}

export function graphQueryPath(filters: GraphFilters): string {
  return `/graph${graphFiltersToSearch(filters)}`;
}

export async function fetchGraph(
  filters: GraphFilters,
  init?: { signal?: AbortSignal },
): Promise<ReactFlowGraph> {
  const url = `${apiBaseUrl()}${graphQueryPath(filters)}`;
  let response: Response;
  try {
    response = await fetch(url, { signal: init?.signal });
  } catch {
    throw new GraphApiError(`Cannot reach API at ${apiBaseUrl()}`, 'network');
  }
  if (!response.ok) {
    let message = response.statusText || `HTTP ${response.status}`;
    try {
      const body: unknown = await response.json();
      if (
        typeof body === 'object' &&
        body !== null &&
        'message' in body &&
        typeof body.message === 'string'
      ) {
        message = body.message;
      }
    } catch {
      /* keep statusText */
    }
    throw new GraphApiError(message, 'http', response.status);
  }
  return (await response.json()) as ReactFlowGraph;
}

export function toCanvasGraph(graph: ReactFlowGraph): ReactFlowGraph {
  return {
    nodes: graph.nodes.map((node) => ({ ...node, type: 'graph' as const })),
    edges: graph.edges,
  };
}
