import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { GraphLoader, GraphLoadError } from './graph.loader';

describe('GraphLoader', () => {
  const loader = new GraphLoader();

  it('normalizes string to into an adjacency list', () => {
    const graph = loader.loadFromUnknown({
      nodes: [
        { name: 'consign-service', kind: 'service', publicExposed: false },
        {
          name: 'consign-price-service',
          kind: 'service',
          publicExposed: false,
        },
      ],
      edges: [{ from: 'consign-service', to: 'consign-price-service' }],
    });
    expect(graph.out.get('consign-service')).toEqual(['consign-price-service']);
    expect(graph.nodes.get('consign-service')?.kind).toBe('service');
  });

  it('drops edges to missing nodes and keeps valid edges', () => {
    const warn = jest.fn();
    const loaderWithWarn = new GraphLoader(warn);
    const graph = loaderWithWarn.loadFromUnknown({
      nodes: [
        { name: 'preserve-service', kind: 'service' },
        { name: 'order-service', kind: 'service' },
      ],
      edges: [
        {
          from: 'preserve-service',
          to: ['assurance-service', 'order-service'],
        },
      ],
    });
    expect(graph.nodes.has('assurance-service')).toBe(false);
    expect(graph.out.get('preserve-service')).toEqual(['order-service']);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('assurance-service'),
    );
  });

  it('defaults missing vulnerabilities to an empty array', () => {
    const graph = loader.loadFromUnknown({
      nodes: [{ name: 'frontend', kind: 'service', publicExposed: true }],
      edges: [],
    });
    expect(graph.nodes.get('frontend')?.vulnerabilities).toEqual([]);
    expect(graph.out.get('frontend')).toEqual([]);
  });

  it('throws GraphLoadError when nodes or edges are missing', () => {
    expect(() => loader.loadFromUnknown({})).toThrow(GraphLoadError);
    expect(() => loader.loadFromUnknown(null)).toThrow(GraphLoadError);
  });

  it('throws GraphLoadError when the file is missing or not JSON', () => {
    expect(() => loader.loadFile('/no/such/graph.json')).toThrow(
      GraphLoadError,
    );
    const dir = join(tmpdir(), `graph-loader-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'bad.json');
    writeFileSync(file, '{');
    try {
      expect(() => loader.loadFile(file)).toThrow(GraphLoadError);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
