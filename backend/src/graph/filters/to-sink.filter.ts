import { Injectable } from '@nestjs/common';
import { FilterName, Graph, Path } from '../domain/graph.types';
import { RouteFilter } from './route-filter';

@Injectable()
export class ToSinkFilter implements RouteFilter {
  readonly name: FilterName = 'toSink';

  matches(path: Path, graph: Graph): boolean {
    const last = graph.nodes.get(path[path.length - 1]);
    return last?.kind === 'rds';
  }
}
