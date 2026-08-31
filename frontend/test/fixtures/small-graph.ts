import type { ReactFlowGraph } from '../../src/api/types';

export const smallGraph: ReactFlowGraph = {
  nodes: [
    {
      id: 'frontend',
      type: 'input',
      position: { x: 0, y: 80 },
      className: 'node-public',
      data: {
        label: 'frontend',
        kind: 'service',
        language: 'java',
        publicExposed: true,
        vulnerabilities: [],
      },
    },
    {
      id: 'order-service',
      type: 'default',
      position: { x: 260, y: 80 },
      className: 'node-vulnerable',
      data: {
        label: 'order-service',
        kind: 'service',
        language: 'java',
        path: 'ts-order-service',
        publicExposed: false,
        vulnerabilities: [
          {
            file: 'order/OrderServiceImpl.java',
            severity: 'high',
            message: 'SQL injection in order query',
            metadata: { cwe: 'CWE-89' },
          },
        ],
      },
    },
    {
      id: 'prod-postgresdb',
      type: 'output',
      position: { x: 520, y: 80 },
      className: 'node-sink',
      data: {
        label: 'prod-postgresdb',
        kind: 'rds',
        publicExposed: false,
        vulnerabilities: [],
        metadata: { cloud: 'AWS', engine: 'postgres' },
      },
    },
  ],
  edges: [
    {
      id: 'frontend->order-service',
      source: 'frontend',
      target: 'order-service',
      markerEnd: { type: 'arrowclosed' },
    },
    {
      id: 'order-service->prod-postgresdb',
      source: 'order-service',
      target: 'prod-postgresdb',
      markerEnd: { type: 'arrowclosed' },
    },
  ],
};

export const emptyGraph: ReactFlowGraph = { nodes: [], edges: [] };
