import { GraphVulnerability } from '../domain/graph.types';

export interface ReactFlowNodeData {
  label: string;
  kind: string;
  language?: string;
  path?: string;
  publicExposed?: boolean;
  vulnerabilities: GraphVulnerability[];
  metadata?: Record<string, unknown>;
}

export interface ReactFlowNode {
  id: string;
  type: 'input' | 'output' | 'default';
  position: { x: number; y: number };
  className: string;
  data: ReactFlowNodeData;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  markerEnd: { type: 'arrowclosed' };
}

export interface ReactFlowGraph {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}
