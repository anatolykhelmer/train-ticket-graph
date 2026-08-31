import { makeGraph } from '../domain/graph.test-util';
import { ReactFlowMapper } from './reactflow.mapper';

describe('ReactFlowMapper', () => {
  const mapper = new ReactFlowMapper();

  it('maps domain fields and assigns finite positions', () => {
    const graph = makeGraph(
      [
        {
          name: 'frontend',
          kind: 'service',
          publicExposed: true,
          language: 'java',
        },
        {
          name: 'order-service',
          kind: 'service',
          vulnerabilities: [{ severity: 'high', message: 'tainted file' }],
        },
        {
          name: 'prod-postgresdb',
          kind: 'rds',
          metadata: { cloud: 'AWS', engine: 'postgres' },
        },
      ],
      [
        ['frontend', 'order-service'],
        ['order-service', 'prod-postgresdb'],
      ],
    );
    const { nodes, edges } = mapper.toReactFlow(graph);
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

    expect(byId.frontend.type).toBe('input');
    expect(byId.frontend.className.split(' ')).toContain('node-public');
    expect(byId.frontend.data.label).toBe('frontend');
    expect(byId.frontend.data.language).toBe('java');

    expect(byId['order-service'].type).toBe('default');
    expect(byId['order-service'].className.split(' ')).toContain(
      'node-vulnerable',
    );
    expect(byId['order-service'].data.vulnerabilities[0].message).toBe(
      'tainted file',
    );

    expect(byId['prod-postgresdb'].type).toBe('output');
    expect(byId['prod-postgresdb'].className.split(' ')).toContain('node-sink');

    for (const node of nodes) {
      expect(Number.isFinite(node.position.x)).toBe(true);
      expect(Number.isFinite(node.position.y)).toBe(true);
    }

    expect(edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'frontend->order-service',
          source: 'frontend',
          target: 'order-service',
          markerEnd: { type: 'arrowclosed' },
        }),
      ]),
    );
  });

  it('returns empty arrays for an empty graph', () => {
    const graph = makeGraph([], []);
    expect(mapper.toReactFlow(graph)).toEqual({ nodes: [], edges: [] });
  });
});
