import { FILTER_NAMES, type GraphFilters } from './types';

export function parseGraphFilters(search: string): GraphFilters {
  const trimmed = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(trimmed);
  return {
    fromPublic: params.get('fromPublic') === 'true',
    toSink: params.get('toSink') === 'true',
    hasVulnerability: params.get('hasVulnerability') === 'true',
  };
}

export function graphFiltersToSearch(filters: GraphFilters): string {
  const params = new URLSearchParams();
  for (const name of FILTER_NAMES) {
    if (filters[name]) {
      params.set(name, 'true');
    }
  }
  const encoded = params.toString();
  return encoded === '' ? '' : `?${encoded}`;
}

export function attackPathFilters(): GraphFilters {
  return { fromPublic: true, toSink: true, hasVulnerability: true };
}
