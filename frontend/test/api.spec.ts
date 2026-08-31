import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { emptyStateKind } from '../src/api/empty-state';
import {
  attackPathFilters,
  graphFiltersToSearch,
  parseGraphFilters,
} from '../src/api/filters';
import {
  apiBaseUrl,
  fetchGraph,
  GraphApiError,
  graphQueryPath,
  toCanvasGraph,
} from '../src/api/graph';
import { nodeRoleClass } from '../src/api/node-role';
import { emptyGraph, smallGraph } from './fixtures/small-graph';
import { server } from './mocks/server';

const off = {
  fromPublic: false,
  toSink: false,
  hasVulnerability: false,
};

describe('parseGraphFilters', () => {
  it('treats omitted keys and non-true values as off', () => {
    expect(parseGraphFilters('')).toEqual(off);
    expect(parseGraphFilters('?toSink=false&fromPublic=1')).toEqual(off);
  });

  it('turns only the literal true on', () => {
    expect(parseGraphFilters('?fromPublic=true&toSink=true')).toEqual({
      ...off,
      fromPublic: true,
      toSink: true,
    });
  });
});

describe('graphFiltersToSearch', () => {
  it('writes only enabled flags', () => {
    expect(graphFiltersToSearch(off)).toBe('');
    expect(graphFiltersToSearch({ ...off, toSink: true })).toBe('?toSink=true');
    expect(graphFiltersToSearch(attackPathFilters())).toBe(
      '?fromPublic=true&toSink=true&hasVulnerability=true',
    );
  });
});

describe('emptyStateKind', () => {
  it('is null when the graph has nodes', () => {
    expect(emptyStateKind(attackPathFilters(), smallGraph)).toBeNull();
  });

  it('uses attack-path copy when fromPublic and toSink are on', () => {
    expect(emptyStateKind(attackPathFilters(), emptyGraph)).toBe('attack-path');
    expect(
      emptyStateKind({ ...off, fromPublic: true, toSink: true }, emptyGraph),
    ).toBe('attack-path');
  });

  it('uses filters copy for other enabled flags', () => {
    expect(
      emptyStateKind({ ...off, hasVulnerability: true }, emptyGraph),
    ).toBe('filters');
  });

  it('uses none when every filter is off', () => {
    expect(emptyStateKind(off, emptyGraph)).toBe('none');
  });
});

describe('toCanvasGraph', () => {
  it('rewrites every node type to graph', () => {
    const canvas = toCanvasGraph(smallGraph);
    expect(canvas.nodes.map((n) => n.type)).toEqual(['graph', 'graph', 'graph']);
    expect(canvas.nodes[0]?.data.label).toBe('frontend');
  });
});

describe('nodeRoleClass', () => {
  it('combines public, sink, and vulnerable', () => {
    expect(nodeRoleClass(smallGraph.nodes[0]!.data)).toContain('graph-node--public');
    expect(nodeRoleClass(smallGraph.nodes[1]!.data)).toContain(
      'graph-node--vulnerable',
    );
    expect(nodeRoleClass(smallGraph.nodes[2]!.data)).toContain('graph-node--sink');
  });
});

describe('fetchGraph', () => {
  it('GETs /graph with enabled flags', async () => {
    const graph = await fetchGraph({ ...off, toSink: true });
    expect(graph.nodes).toHaveLength(3);
    expect(graphQueryPath({ ...off, toSink: true })).toBe('/graph?toSink=true');
  });

  it('throws GraphApiError network when the API is down', async () => {
    server.use(
      http.get('http://localhost:3000/graph', () => HttpResponse.error()),
    );
    await expect(fetchGraph(off)).rejects.toMatchObject({
      kind: 'network',
      message: `Cannot reach API at ${apiBaseUrl()}`,
    });
  });

  it('throws GraphApiError http with API message on 500', async () => {
    server.use(
      http.get('http://localhost:3000/graph', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    await expect(fetchGraph(off)).rejects.toBeInstanceOf(GraphApiError);
    await expect(fetchGraph(off)).rejects.toMatchObject({
      kind: 'http',
      status: 500,
      message: 'boom',
    });
  });
});
