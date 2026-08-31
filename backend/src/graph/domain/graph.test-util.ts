import { Graph, GraphNode } from './graph.types';

export function makeGraph(
  nodes: Array<Partial<GraphNode> & Pick<GraphNode, 'name' | 'kind'>>,
  edges: Array<[string, string]>,
): Graph {
  const nodeMap = new Map<string, GraphNode>();
  const out = new Map<string, string[]>();
  for (const n of nodes) {
    nodeMap.set(n.name, {
      name: n.name,
      kind: n.kind,
      language: n.language,
      path: n.path,
      publicExposed: n.publicExposed === true,
      vulnerabilities: n.vulnerabilities ?? [],
      metadata: n.metadata,
    });
    out.set(n.name, []);
  }
  for (const [from, to] of edges) {
    out.get(from)!.push(to);
  }
  return { nodes: nodeMap, out };
}
