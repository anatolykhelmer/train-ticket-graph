import { makeGraph } from '../domain/graph.test-util';
import { Path } from '../domain/graph.types';
import { PathFinder } from './path-finder';

describe('PathFinder', () => {
  const finder = new PathFinder();

  it('terminates on a cycle and does not repeat a node on a path', () => {
    const graph = makeGraph(
      [
        { name: 'A', kind: 'service' },
        { name: 'B', kind: 'service' },
      ],
      [
        ['A', 'B'],
        ['B', 'A'],
      ],
    );
    const seen: string[] = [];
    const subgraph = finder.collectMatchingSubgraph(
      graph,
      ['A'],
      (path: Path) => {
        seen.push(path.join('>'));
        return true;
      },
    );
    expect(seen).toEqual(['A', 'A>B']);
    expect([...subgraph.nodes.keys()].sort()).toEqual(['A', 'B']);
    expect(subgraph.out.get('A')).toEqual(['B']);
    expect(subgraph.out.get('B')).toEqual([]);
  });

  it('unions only nodes and edges on matching paths', () => {
    const graph = makeGraph(
      [
        { name: 'frontend', kind: 'service', publicExposed: true },
        { name: 'mid', kind: 'service' },
        { name: 'db', kind: 'rds' },
        { name: 'noise', kind: 'service' },
      ],
      [
        ['frontend', 'mid'],
        ['mid', 'db'],
        ['noise', 'db'],
      ],
    );
    const subgraph = finder.collectMatchingSubgraph(
      graph,
      ['frontend'],
      (path) => path[path.length - 1] === 'db',
    );
    expect([...subgraph.nodes.keys()].sort()).toEqual([
      'db',
      'frontend',
      'mid',
    ]);
    expect(subgraph.out.get('frontend')).toEqual(['mid']);
    expect(subgraph.out.get('mid')).toEqual(['db']);
    expect(subgraph.nodes.has('noise')).toBe(false);
  });

  it('includes a one-node path when it matches', () => {
    const graph = makeGraph(
      [{ name: 'gateway-service', kind: 'service', publicExposed: true }],
      [],
    );
    const subgraph = finder.collectMatchingSubgraph(
      graph,
      ['gateway-service'],
      () => true,
    );
    expect([...subgraph.nodes.keys()]).toEqual(['gateway-service']);
    expect(subgraph.out.get('gateway-service')).toEqual([]);
  });

  it('returns an empty graph when nothing matches', () => {
    const graph = makeGraph([{ name: 'A', kind: 'service' }], []);
    const subgraph = finder.collectMatchingSubgraph(graph, ['A'], () => false);
    expect(subgraph.nodes.size).toBe(0);
    expect(subgraph.out.size).toBe(0);
  });

  it('returns empty quickly when nothing matches on a multi-node graph', () => {
    const names = Array.from({ length: 16 }, (_, i) => `n${i}`);
    const edges: Array<[string, string]> = [];
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        edges.push([names[i], names[j]]);
      }
    }
    const graph = makeGraph(
      names.map((name) => ({ name, kind: 'service' })),
      edges,
    );
    const startedAt = Date.now();
    const subgraph = finder.collectMatchingSubgraph(graph, ['n0'], () => false);
    expect(subgraph.nodes.size).toBe(0);
    expect(subgraph.out.size).toBe(0);
    expect(Date.now() - startedAt).toBeLessThan(2000);
  });

  it('does not reach a sink that is only reachable against edge direction', () => {
    const graph = makeGraph(
      [
        { name: 'P', kind: 'service', publicExposed: true },
        { name: 'A', kind: 'service' },
        { name: 'S', kind: 'rds' },
      ],
      [
        ['P', 'A'],
        ['S', 'A'],
      ],
    );
    const subgraph = finder.collectMatchingSubgraph(
      graph,
      ['P'],
      (path) => path[path.length - 1] === 'S',
    );
    expect(subgraph.nodes.size).toBe(0);
  });

  it('does not add nodes whose only edge points into the matching path', () => {
    const graph = makeGraph(
      [
        { name: 'frontend', kind: 'service', publicExposed: true },
        { name: 'mid', kind: 'service' },
        { name: 'db', kind: 'rds' },
        { name: 'noise', kind: 'service' },
      ],
      [
        ['frontend', 'mid'],
        ['mid', 'db'],
        ['noise', 'db'],
      ],
    );
    const subgraph = finder.collectMatchingSubgraph(
      graph,
      ['frontend'],
      (path) => path[path.length - 1] === 'db',
    );
    expect(subgraph.nodes.has('noise')).toBe(false);
    expect([...subgraph.nodes.keys()].sort()).toEqual([
      'db',
      'frontend',
      'mid',
    ]);
  });
});
