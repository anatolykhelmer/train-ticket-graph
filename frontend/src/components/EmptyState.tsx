import { EMPTY_STATE_COPY, EMPTY_STATE_TITLE, type EmptyStateKind } from '../api/empty-state';

export function EmptyState({ kind }: { kind: EmptyStateKind }) {
  const body = EMPTY_STATE_COPY[kind];
  return (
    <div className="empty-banner" role="status">
      <strong>{EMPTY_STATE_TITLE[kind]}</strong>
      {body ? <p>{body}</p> : null}
    </div>
  );
}
