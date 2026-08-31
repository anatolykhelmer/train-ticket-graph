import { Injectable } from '@nestjs/common';
import { FilterName, Graph } from '../domain/graph.types';
import { FilterRegistry } from '../filters/filter.registry';
import { GraphStore } from '../graph.store';
import { PathFinder } from '../pathfinding/path-finder';

@Injectable()
export class GraphQueryService {
  constructor(
    private readonly store: GraphStore,
    private readonly pathFinder: PathFinder,
    private readonly registry: FilterRegistry,
  ) {}

  query(enabled: ReadonlySet<FilterName>): Graph {
    const graph = this.store.getGraph();
    if (enabled.size === 0) {
      return graph;
    }
    const filters = [...enabled].map((name) => this.registry.get(name));
    const starts = enabled.has('fromPublic')
      ? [...graph.nodes.values()]
          .filter((node) => node.publicExposed === true)
          .map((node) => node.name)
      : [...graph.nodes.keys()];
    return this.pathFinder.collectMatchingSubgraph(graph, starts, (path) =>
      filters.every((filter) => filter.matches(path, graph)),
    );
  }
}
