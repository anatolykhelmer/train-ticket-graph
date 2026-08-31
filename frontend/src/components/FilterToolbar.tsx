import { FILTER_NAMES, type FilterName, type GraphFilters } from '../api/types';

export interface FilterToolbarProps {
  filters: GraphFilters;
  nodeCount?: number;
  edgeCount?: number;
  fetching: boolean;
  onToggle: (name: FilterName, value: boolean) => void;
  onAttackPath: () => void;
}

export function FilterToolbar({
  filters,
  nodeCount,
  edgeCount,
  fetching,
  onToggle,
  onAttackPath,
}: FilterToolbarProps) {
  return (
    <header className="toolbar">
      <strong>Train Ticket graph</strong>
      {FILTER_NAMES.map((name) => (
        <label key={name}>
          <input
            type="checkbox"
            checked={filters[name]}
            onChange={(event) => onToggle(name, event.target.checked)}
          />
          {name}
        </label>
      ))}
      <button type="button" onClick={onAttackPath}>
        Attack path
      </button>
      {nodeCount !== undefined && edgeCount !== undefined ? (
        <span className="toolbar-count">
          {nodeCount} nodes · {edgeCount} edges
        </span>
      ) : null}
      {fetching ? (
        <span className="toolbar-spinner" aria-live="polite">
          Loading…
        </span>
      ) : null}
    </header>
  );
}
