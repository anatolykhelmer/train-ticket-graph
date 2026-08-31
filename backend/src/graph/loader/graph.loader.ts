import { readFileSync } from 'node:fs';
import { Graph, GraphNode, GraphVulnerability } from '../domain/graph.types';

export class GraphLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GraphLoadError';
  }
}

type WarnFn = (message: string) => void;

export class GraphLoader {
  constructor(private readonly warn: WarnFn = () => undefined) {}

  loadFile(filePath: string): Graph {
    let text: string;
    try {
      text = readFileSync(filePath, 'utf8');
    } catch {
      throw new GraphLoadError(`Graph file not found: ${filePath}`);
    }
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new GraphLoadError(`Invalid JSON in graph file: ${filePath}`);
    }
    return this.loadFromUnknown(raw);
  }

  loadFromUnknown(raw: unknown): Graph {
    if (raw === null || typeof raw !== 'object') {
      throw new GraphLoadError('Graph JSON must be an object');
    }
    const obj = raw as { nodes?: unknown; edges?: unknown };
    if (!Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) {
      throw new GraphLoadError('Graph JSON must have nodes and edges arrays');
    }

    const nodes = new Map<string, GraphNode>();
    for (const item of obj.nodes) {
      const node = this.parseNode(item);
      if (!node) continue;
      nodes.set(node.name, node);
    }

    const out = new Map<string, string[]>();
    for (const name of nodes.keys()) {
      out.set(name, []);
    }

    for (const item of obj.edges) {
      this.parseEdge(item, nodes, out);
    }

    return { nodes, out };
  }

  private parseNode(item: unknown): GraphNode | null {
    if (item === null || typeof item !== 'object') {
      this.warn('Skipping malformed node');
      return null;
    }
    const n = item as Record<string, unknown>;
    if (typeof n.name !== 'string' || n.name.length === 0) {
      this.warn('Skipping node without a name');
      return null;
    }
    const vulnerabilities = Array.isArray(n.vulnerabilities)
      ? (n.vulnerabilities as GraphVulnerability[])
      : [];
    return {
      name: n.name,
      kind: typeof n.kind === 'string' ? n.kind : 'unknown',
      language: typeof n.language === 'string' ? n.language : undefined,
      path: typeof n.path === 'string' ? n.path : undefined,
      publicExposed: n.publicExposed === true,
      vulnerabilities,
      metadata:
        n.metadata && typeof n.metadata === 'object'
          ? (n.metadata as Record<string, unknown>)
          : undefined,
    };
  }

  private parseEdge(
    item: unknown,
    nodes: Map<string, GraphNode>,
    out: Map<string, string[]>,
  ): void {
    if (item === null || typeof item !== 'object') {
      this.warn('Skipping malformed edge');
      return;
    }
    const e = item as { from?: unknown; to?: unknown };
    if (typeof e.from !== 'string' || !nodes.has(e.from)) {
      this.warn(`Skipping edge from unknown node: ${String(e.from)}`);
      return;
    }
    const targets = Array.isArray(e.to)
      ? e.to
      : typeof e.to === 'string'
        ? [e.to]
        : [];
    const neighbors = out.get(e.from)!;
    for (const target of targets) {
      if (typeof target !== 'string' || !nodes.has(target)) {
        this.warn(`Skipping dangling edge ${e.from} -> ${String(target)}`);
        continue;
      }
      if (!neighbors.includes(target)) {
        neighbors.push(target);
      }
    }
  }
}
