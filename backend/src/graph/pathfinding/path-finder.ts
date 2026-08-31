import { Injectable } from '@nestjs/common';
import { Graph, GraphNode, Path } from '../domain/graph.types';

@Injectable()
export class PathFinder {
  /**
   * Enumerates directed simple paths from `starts` and returns the union of
   * every path the predicate accepts. Skipping nodes already on the path keeps
   * the walk finite even if the graph gains a cycle later.
   */
  collectMatchingSubgraph(
    graph: Graph,
    starts: string[],
    matches: (path: Path) => boolean,
  ): Graph {
    const includedNodes = new Set<string>();
    const includedEdges: Array<[string, string]> = [];
    const edgeSeen = new Set<string>();

    const includePath = (path: Path) => {
      for (const name of path) {
        includedNodes.add(name);
      }
      for (let i = 0; i < path.length - 1; i++) {
        const key = `${path[i]}\0${path[i + 1]}`;
        if (!edgeSeen.has(key)) {
          edgeSeen.add(key);
          includedEdges.push([path[i], path[i + 1]]);
        }
      }
    };

    const dfs = (path: string[], onPath: Set<string>): void => {
      if (matches(path)) {
        includePath(path);
      }
      const last = path[path.length - 1];
      for (const next of graph.out.get(last) ?? []) {
        if (onPath.has(next)) {
          continue;
        }
        path.push(next);
        onPath.add(next);
        dfs(path, onPath);
        onPath.delete(next);
        path.pop();
      }
    };

    for (const start of starts) {
      if (!graph.nodes.has(start)) {
        continue;
      }
      dfs([start], new Set([start]));
    }

    const nodes = new Map<string, GraphNode>();
    const out = new Map<string, string[]>();
    for (const name of includedNodes) {
      nodes.set(name, graph.nodes.get(name)!);
      out.set(name, []);
    }
    for (const [from, to] of includedEdges) {
      out.get(from)!.push(to);
    }
    return { nodes, out };
  }
}
