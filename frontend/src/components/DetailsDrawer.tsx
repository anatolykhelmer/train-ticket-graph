import type { ApiGraphNode } from '../api/types';

export function DetailsDrawer({
  node,
  onClose,
}: {
  node: ApiGraphNode;
  onClose: () => void;
}) {
  return (
    <aside className="drawer" aria-label="Node details">
      <header>
        <h2>{node.data.label}</h2>
        <button type="button" aria-label="Close details" onClick={onClose}>
          ×
        </button>
      </header>
      <p>
        {node.data.kind}
        {node.data.language ? ` · ${node.data.language}` : ''}
      </p>
      {node.data.path ? (
        <div>
          <strong>path</strong> {node.data.path}
        </div>
      ) : null}
      <div>
        <strong>publicExposed</strong> {String(node.data.publicExposed ?? false)}
      </div>
      {node.data.vulnerabilities.length > 0 ? (
        <section>
          <h3>Vulnerabilities</h3>
          {node.data.vulnerabilities.map((item, index) => (
            <div key={`${item.metadata?.cwe ?? 'vuln'}-${index}`}>
              {item.metadata?.cwe ? <div>{item.metadata.cwe}</div> : null}
              {item.message ? <div>{item.message}</div> : null}
              {item.severity ? <div>{item.severity}</div> : null}
              {item.file ? <div>{item.file}</div> : null}
            </div>
          ))}
        </section>
      ) : null}
    </aside>
  );
}
