import { BadRequestException } from '@nestjs/common';
import { FilterName } from '../domain/graph.types';

const ALLOWED: FilterName[] = ['fromPublic', 'toSink', 'hasVulnerability'];
const ALLOWED_SET = new Set<string>(ALLOWED);

export function parseGraphQuery(
  query: Record<string, unknown>,
): Set<FilterName> {
  for (const key of Object.keys(query)) {
    if (!ALLOWED_SET.has(key)) {
      throw new BadRequestException(`Unknown query parameter: ${key}`);
    }
  }
  const enabled = new Set<FilterName>();
  for (const name of ALLOWED) {
    if (!(name in query)) {
      continue;
    }
    const value = query[name];
    if (Array.isArray(value)) {
      throw new BadRequestException(`Invalid value for ${name}`);
    }
    if (value === 'true' || value === true) {
      enabled.add(name);
    } else if (value === 'false' || value === false) {
      continue;
    } else {
      throw new BadRequestException(`Invalid value for ${name}`);
    }
  }
  return enabled;
}
