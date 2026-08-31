import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { nodeRoleClass } from '../api/node-role';
import type { ReactFlowNodeData } from '../api/types';

type GraphFlowNode = Node<ReactFlowNodeData, 'graph'>;

export function GraphNode({ data }: NodeProps<GraphFlowNode>) {
  const vulnerable = data.vulnerabilities.length > 0;
  return (
    <div className={nodeRoleClass(data)}>
      <Handle type="target" position={Position.Left} />
      <div className="graph-node__title">
        <span>{data.label}</span>
        {vulnerable ? <span className="graph-node__badge">vuln</span> : null}
      </div>
      <div className="graph-node__meta">
        {data.kind}
        {data.publicExposed ? ' · public' : ''}
        {data.kind === 'rds' ? ' · sink' : ''}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
