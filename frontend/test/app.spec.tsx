import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { emptyGraph, smallGraph } from './fixtures/small-graph';
import { server } from './mocks/server';
import { renderApp } from '../src/test-utils/render-app';

vi.mock('../src/components/GraphCanvas', () => ({
  GraphCanvas: ({
    nodes,
    selectedId,
    onNodeSelect,
    onPaneClick,
  }: import('../src/components/GraphCanvas').GraphCanvasProps) => (
    <div data-testid="graph-canvas" onClick={onPaneClick}>
      {nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          data-testid={`node-${node.id}`}
          aria-pressed={selectedId === node.id}
          onClick={(event) => {
            event.stopPropagation();
            onNodeSelect(node.id);
          }}
        >
          {node.data.label}
        </button>
      ))}
    </div>
  ),
}));

const recordedRequests: URL[] = [];

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  recordedRequests.length = 0;
  window.history.replaceState(null, '', '/');
  server.use(
    http.get('http://localhost:3000/graph', ({ request }) => {
      recordedRequests.push(new URL(request.url));
      return HttpResponse.json(smallGraph);
    }),
  );
});

describe('App', () => {
  it('shows node and edge counts from the fixture', async () => {
    renderApp();
    expect(await screen.findByText('3 nodes · 2 edges')).toBeInTheDocument();
  });

  it('opens the drawer with name and CWE on node click', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(await screen.findByTestId('node-order-service'));
    expect(screen.getByRole('heading', { name: 'order-service' })).toBeInTheDocument();
    expect(screen.getByText('CWE-89')).toBeInTheDocument();
    expect(screen.getByText('SQL injection in order query')).toBeInTheDocument();
  });

  it('writes toSink into the URL and request', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('3 nodes · 2 edges');
    await user.click(screen.getByRole('checkbox', { name: 'toSink' }));
    await waitFor(() => {
      expect(window.location.search).toBe('?toSink=true');
      expect(recordedRequests.some((url) => url.search === '?toSink=true')).toBe(
        true,
      );
    });
  });

  it('Attack path enables all three flags', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('3 nodes · 2 edges');
    await user.click(screen.getByRole('button', { name: 'Attack path' }));
    await waitFor(() => {
      expect(window.location.search).toContain('fromPublic=true');
      expect(window.location.search).toContain('toSink=true');
      expect(window.location.search).toContain('hasVulnerability=true');
      expect(
        recordedRequests.some(
          (url) =>
            url.searchParams.get('fromPublic') === 'true' &&
            url.searchParams.get('toSink') === 'true' &&
            url.searchParams.get('hasVulnerability') === 'true',
        ),
      ).toBe(true);
    });
  });

  it('shows the dataset banner for empty attack-path results without a toast', async () => {
    server.use(
      http.get('http://localhost:3000/graph', () =>
        HttpResponse.json(emptyGraph),
      ),
    );
    window.history.replaceState(
      null,
      '',
      '/?fromPublic=true&toSink=true&hasVulnerability=true',
    );
    renderApp();
    expect(
      await screen.findByText('No matching routes.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no directed path goes from a public node to RDS/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('boom')).not.toBeInTheDocument();
    expect(document.querySelector('[data-sonner-toast]')).toBeNull();
  });

  it('shows the dataset banner for fromPublic and toSink without hasVulnerability', async () => {
    server.use(
      http.get('http://localhost:3000/graph', () =>
        HttpResponse.json(emptyGraph),
      ),
    );
    window.history.replaceState(null, '', '/?fromPublic=true&toSink=true');
    renderApp();
    expect(
      await screen.findByText('No matching routes.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no directed path goes from a public node to RDS/i),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-sonner-toast]')).toBeNull();
  });

  it('shows the generic empty banner when all filters are off', async () => {
    server.use(
      http.get('http://localhost:3000/graph', () =>
        HttpResponse.json(emptyGraph),
      ),
    );
    renderApp();
    expect(await screen.findByText('No nodes returned.')).toBeInTheDocument();
    expect(document.querySelector('[data-sonner-toast]')).toBeNull();
  });

  it('shows the generic empty banner when only hasVulnerability is on', async () => {
    server.use(
      http.get('http://localhost:3000/graph', () =>
        HttpResponse.json(emptyGraph),
      ),
    );
    window.history.replaceState(null, '', '/?hasVulnerability=true');
    renderApp();
    expect(
      await screen.findByText('No matching routes for the current filters.'),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-sonner-toast]')).toBeNull();
  });

  it('toasts on 500 and keeps the previous graph', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByTestId('node-frontend');
    server.use(
      http.get('http://localhost:3000/graph', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    await user.click(screen.getByRole('checkbox', { name: 'toSink' }));
    expect(await screen.findByText('boom')).toBeInTheDocument();
    expect(screen.getByTestId('node-frontend')).toBeInTheDocument();
  });

  it('toasts the API URL on network failure', async () => {
    server.use(
      http.get('http://localhost:3000/graph', () => HttpResponse.error()),
    );
    renderApp();
    expect(
      await screen.findByText('Cannot reach API at http://localhost:3000'),
    ).toBeInTheDocument();
  });
});
