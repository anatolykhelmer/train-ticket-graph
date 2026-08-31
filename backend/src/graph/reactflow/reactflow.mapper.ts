import { Injectable } from '@nestjs/common';
import dagre from '@dagrejs/dagre';
import { Graph, GraphNode } from '../domain/graph.types';
import {
  ReactFlowEdge,
  ReactFlowGraph,
  ReactFlowNode,
} from './reactflow.types';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 48;

@Injectable()
export class ReactFlowMapper {
  toReactFlow(graph: Graph): ReactFlowGraph {
    if (graph.nodes.size === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes: ReactFlowNode[] = [...graph.nodes.values()].map((node) =>
      this.toNode(node),
    );
    const edges: ReactFlowEdge[] = [];
    for (const [from, targets] of graph.out) {
      for (const to of targets) {
        edges.push({
          id: `${from}->${to}`,
          source: from,
          target: to,
          markerEnd: { type: 'arrowclosed' },
        });
      }
    }
    return { nodes: this.layout(nodes, edges), edges };
  }

  private toNode(node: GraphNode): ReactFlowNode {
    const classes: string[] = [];
    if (node.publicExposed === true) {
      classes.push('node-public');
    }
    if (node.kind === 'rds') {
      classes.push('node-sink');
    }
    if (node.vulnerabilities.length > 0) {
      classes.push('node-vulnerable');
    }
    const type: ReactFlowNode['type'] =
      node.publicExposed === true
        ? 'input'
        : node.kind === 'rds'
          ? 'output'
          : 'default';
    return {
      id: node.name,
      type,
      position: { x: 0, y: 0 },
      className: classes.join(' '),
      data: {
        label: node.name,
        kind: node.kind,
        language: node.language,
        path: node.path,
        publicExposed: node.publicExposed,
        vulnerabilities: node.vulnerabilities,
        metadata: node.metadata,
      },
    };
  }

  private layout(
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[],
  ): ReactFlowNode[] {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR' });
    g.setDefaultEdgeLabel(() => ({}));
    for (const node of nodes) {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    for (const edge of edges) {
      g.setEdge(edge.source, edge.target);
    }
    dagre.layout(g);
    return nodes.map((node) => {
      const laidOut = g.node(node.id);
      return {
        ...node,
        position: {
          x: laidOut.x - NODE_WIDTH / 2,
          y: laidOut.y - NODE_HEIGHT / 2,
        },
      };
    });
  }
}
