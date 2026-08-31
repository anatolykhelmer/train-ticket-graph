import { FilterName, Graph, Path } from '../domain/graph.types';

export interface RouteFilter {
  readonly name: FilterName;
  matches(path: Path, graph: Graph): boolean;
}
