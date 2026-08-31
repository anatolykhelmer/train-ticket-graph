export type FilterName = 'fromPublic' | 'toSink' | 'hasVulnerability';

export const FILTER_NAMES = [
  'fromPublic',
  'toSink',
  'hasVulnerability',
] as const satisfies readonly FilterName[];

export interface GraphFilters {
  fromPublic: boolean;
  toSink: boolean;
  hasVulnerability: boolean;
}

export interface GraphVulnerability {
  file?: string;
  severity?: string;
  message?: string;
  metadata?: { cwe?: string };
}

export interface ReactFlowNodeData {
  [key: string]: unknown;
  label: string;
  kind: string;
  language?: string;
  path?: string;
  publicExposed?: boolean;
  vulnerabilities: GraphVulnerability[];
  metadata?: Record<string, unknown>;
}

export interface ApiGraphNode {
  id: string;
  type: 'input' | 'output' | 'default' | 'graph';
  position: { x: number; y: number };
  className: string;
  data: ReactFlowNodeData;
}

export interface ApiGraphEdge {
  id: string;
  source: string;
  target: string;
  markerEnd: { type: 'arrowclosed' };
}

export interface ReactFlowGraph {
  nodes: ApiGraphNode[];
  edges: ApiGraphEdge[];
}
