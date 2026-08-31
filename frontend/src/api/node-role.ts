import type { ReactFlowNodeData } from './types';

export function nodeRoleClass(data: ReactFlowNodeData): string {
  const classes = ['graph-node'];
  if (data.publicExposed === true) {
    classes.push('graph-node--public');
  }
  if (data.kind === 'rds') {
    classes.push('graph-node--sink');
  }
  if (data.vulnerabilities.length > 0) {
    classes.push('graph-node--vulnerable');
  }
  return classes.join(' ');
}
