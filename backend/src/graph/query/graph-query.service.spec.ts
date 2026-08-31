import { makeGraph } from '../domain/graph.test-util';
import { FilterName } from '../domain/graph.types';
import { FilterRegistry } from '../filters/filter.registry';
import { FromPublicFilter } from '../filters/from-public.filter';
import { HasVulnerabilityFilter } from '../filters/has-vulnerability.filter';
import { ToSinkFilter } from '../filters/to-sink.filter';
import { GraphStore } from '../graph.store';
import { PathFinder } from '../pathfinding/path-finder';
import { GraphQueryService } from './graph-query.service';

const fixture = makeGraph(
  [
    { name: 'frontend', kind: 'service', publicExposed: true },
    { name: 'mid', kind: 'service' },
    {
      name: 'vuln',
      kind: 'service',
      vulnerabilities: [{ severity: 'high', message: 'sqli' }],
    },
    { name: 'db', kind: 'rds' },
    { name: 'isolated', kind: 'service' },
    { name: 'gateway-service', kind: 'service', publicExposed: true },
  ],
  [
    ['frontend', 'mid'],
    ['mid', 'vuln'],
    ['vuln', 'db'],
  ],
);

function service(): GraphQueryService {
  const store = new GraphStore();
  store.setGraph(fixture);
  return new GraphQueryService(
    store,
    new PathFinder(),
    new FilterRegistry(
      new FromPublicFilter(),
      new ToSinkFilter(),
      new HasVulnerabilityFilter(),
    ),
  );
}

describe('GraphQueryService', () => {
  it('returns the full graph when no filters are enabled', () => {
    const result = service().query(new Set());
    expect([...result.nodes.keys()].sort()).toEqual(
      [...fixture.nodes.keys()].sort(),
    );
    expect(result.nodes.has('isolated')).toBe(true);
  });

  it('all three flags keep the attack path and drop isolated/gateway', () => {
    const enabled: ReadonlySet<FilterName> = new Set([
      'fromPublic',
      'toSink',
      'hasVulnerability',
    ]);
    const result = service().query(enabled);
    expect([...result.nodes.keys()].sort()).toEqual([
      'db',
      'frontend',
      'mid',
      'vuln',
    ]);
    expect(result.nodes.has('isolated')).toBe(false);
    expect(result.nodes.has('gateway-service')).toBe(false);
    expect(result.out.get('frontend')).toEqual(['mid']);
    expect(result.out.get('vuln')).toEqual(['db']);
  });

  it('fromPublic alone includes gateway as a one-node route', () => {
    const result = service().query(new Set<FilterName>(['fromPublic']));
    expect(result.nodes.has('gateway-service')).toBe(true);
    expect(result.nodes.has('frontend')).toBe(true);
    expect(result.nodes.has('isolated')).toBe(false);
  });
});
