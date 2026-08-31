import { Path } from '../domain/graph.types';
import { makeGraph } from '../domain/graph.test-util';
import { FromPublicFilter } from './from-public.filter';
import { ToSinkFilter } from './to-sink.filter';
import { HasVulnerabilityFilter } from './has-vulnerability.filter';
import { FilterRegistry } from './filter.registry';

const graph = makeGraph(
  [
    { name: 'frontend', kind: 'service', publicExposed: true },
    {
      name: 'order-service',
      kind: 'service',
      vulnerabilities: [{ severity: 'high', message: 'tainted file' }],
    },
    { name: 'prod-postgresdb', kind: 'rds' },
    { name: 'gateway-service', kind: 'service', publicExposed: true },
    { name: 'prod-sqs', kind: 'sqs' },
  ],
  [
    ['frontend', 'order-service'],
    ['order-service', 'prod-postgresdb'],
  ],
);

const attackPath: Path = ['frontend', 'order-service', 'prod-postgresdb'];
const noVulnPath: Path = ['frontend', 'prod-postgresdb'];
const gatewayAlone: Path = ['gateway-service'];
const sqsPath: Path = ['frontend', 'prod-sqs'];

describe('route filters', () => {
  const fromPublic = new FromPublicFilter();
  const toSink = new ToSinkFilter();
  const hasVulnerability = new HasVulnerabilityFilter();

  it.each([
    [attackPath, true],
    [gatewayAlone, true],
    [['order-service'], false],
  ] as Array<[Path, boolean]>)('fromPublic on %j → %s', (path, expected) => {
    expect(fromPublic.matches(path, graph)).toBe(expected);
  });

  it.each([
    [attackPath, true],
    [gatewayAlone, false],
    [sqsPath, false],
    [['prod-postgresdb'], true],
  ] as Array<[Path, boolean]>)('toSink on %j → %s', (path, expected) => {
    expect(toSink.matches(path, graph)).toBe(expected);
  });

  it.each([
    [attackPath, true],
    [noVulnPath, false],
    [gatewayAlone, false],
    [['order-service'], true],
  ] as Array<[Path, boolean]>)(
    'hasVulnerability on %j → %s',
    (path, expected) => {
      expect(hasVulnerability.matches(path, graph)).toBe(expected);
    },
  );

  it('AND of all three: attack path passes, gateway and no-vuln fail', () => {
    const and = (path: Path) =>
      fromPublic.matches(path, graph) &&
      toSink.matches(path, graph) &&
      hasVulnerability.matches(path, graph);
    expect(and(attackPath)).toBe(true);
    expect(and(gatewayAlone)).toBe(false);
    expect(and(noVulnPath)).toBe(false);
  });
});

describe('FilterRegistry', () => {
  it('returns filters by name and lists known names', () => {
    const registry = new FilterRegistry(
      new FromPublicFilter(),
      new ToSinkFilter(),
      new HasVulnerabilityFilter(),
    );
    expect(registry.knownNames().sort()).toEqual(
      ['fromPublic', 'hasVulnerability', 'toSink'].sort(),
    );
    expect(registry.get('fromPublic').name).toBe('fromPublic');
    expect(registry.get('toSink').name).toBe('toSink');
    expect(registry.get('hasVulnerability').name).toBe('hasVulnerability');
  });
});
