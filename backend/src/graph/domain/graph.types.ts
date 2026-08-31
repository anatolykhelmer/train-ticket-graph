export type FilterName = 'fromPublic' | 'toSink' | 'hasVulnerability';

export interface GraphVulnerability {
  file?: string;
  severity?: string;
  message?: string;
  metadata?: { cwe?: string };
}

export interface GraphNode {
  name: string;
  kind: string;
  language?: string;
  path?: string;
  publicExposed?: boolean;
  vulnerabilities: GraphVulnerability[];
  metadata?: Record<string, unknown>;
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  out: Map<string, string[]>;
}

export type Path = readonly string[];
