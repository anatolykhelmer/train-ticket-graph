import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import { useEffect, useMemo } from 'react';
import '@xyflow/react/dist/style.css';
import { toCanvasGraph } from '../api/graph';
import type { ApiGraphEdge, ApiGraphNode } from '../api/types';
import { GraphNode } from './GraphNode';

export interface GraphCanvasProps {
  nodes: ApiGraphNode[];
  edges: ApiGraphEdge[];
  selectedId: string | null;
  onNodeSelect: (id: string) => void;
  onPaneClick: () => void;
}

const nodeTypes = { graph: GraphNode };

function CanvasInner({
  nodes,
  edges,
  selectedId,
  onNodeSelect,
  onPaneClick,
}: GraphCanvasProps) {
  const { fitView } = useReactFlow();
  const canvas = useMemo(
    () => toCanvasGraph({ nodes, edges }),
    [nodes, edges],
  );
  const rfNodes = useMemo(
    () =>
      canvas.nodes.map((node) => ({
        ...node,
        selected: node.id === selectedId,
      })),
    [canvas.nodes, selectedId],
  );
  const rfEdges = useMemo(
    () =>
      canvas.edges.map((edge) => ({
        ...edge,
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [canvas.edges],
  );

  useEffect(() => {
    if (canvas.nodes.length === 0) {
      return;
    }
    const id = requestAnimationFrame(() => {
      void fitView({ padding: 0.2 });
    });
    return () => cancelAnimationFrame(id);
  }, [fitView, canvas.nodes, canvas.edges]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      onNodeClick={(_event, node) => onNodeSelect(node.id)}
      onPaneClick={onPaneClick}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls position="top-left" />
      <MiniMap />
    </ReactFlow>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <div className="canvas-root">
      <ReactFlowProvider>
        <CanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
