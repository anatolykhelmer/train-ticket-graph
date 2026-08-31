import { Injectable } from '@nestjs/common';
import { FilterName, Graph, Path } from '../domain/graph.types';
import { RouteFilter } from './route-filter';

@Injectable()
export class FromPublicFilter implements RouteFilter {
  readonly name: FilterName = 'fromPublic';

  matches(path: Path, graph: Graph): boolean {
    const first = graph.nodes.get(path[0]);
    return first?.publicExposed === true;
  }
}
