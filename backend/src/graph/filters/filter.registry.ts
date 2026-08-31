import { Injectable } from '@nestjs/common';
import { FilterName } from '../domain/graph.types';
import { FromPublicFilter } from './from-public.filter';
import { HasVulnerabilityFilter } from './has-vulnerability.filter';
import { RouteFilter } from './route-filter';
import { ToSinkFilter } from './to-sink.filter';

@Injectable()
export class FilterRegistry {
  private readonly byName: Map<FilterName, RouteFilter>;

  constructor(
    fromPublic: FromPublicFilter,
    toSink: ToSinkFilter,
    hasVulnerability: HasVulnerabilityFilter,
  ) {
    this.byName = new Map<FilterName, RouteFilter>([
      [fromPublic.name, fromPublic],
      [toSink.name, toSink],
      [hasVulnerability.name, hasVulnerability],
    ]);
  }

  get(name: FilterName): RouteFilter {
    const filter = this.byName.get(name);
    if (!filter) {
      throw new Error(`Unknown filter: ${name}`);
    }
    return filter;
  }

  knownNames(): FilterName[] {
    return [...this.byName.keys()];
  }
}
