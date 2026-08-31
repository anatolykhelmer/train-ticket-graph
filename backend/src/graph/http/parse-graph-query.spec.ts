import { BadRequestException } from '@nestjs/common';
import { parseGraphQuery } from './parse-graph-query';

describe('parseGraphQuery', () => {
  it('returns an empty set when no flags are present', () => {
    expect(parseGraphQuery({})).toEqual(new Set());
  });

  it('enables true flags and ignores false', () => {
    expect(
      parseGraphQuery({
        fromPublic: 'true',
        toSink: 'false',
        hasVulnerability: 'true',
      }),
    ).toEqual(new Set(['fromPublic', 'hasVulnerability']));
  });

  it('rejects unknown keys', () => {
    expect(() => parseGraphQuery({ nope: 'true' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects non-boolean values including 1 and empty string', () => {
    expect(() => parseGraphQuery({ fromPublic: '1' })).toThrow(
      BadRequestException,
    );
    expect(() => parseGraphQuery({ fromPublic: '' })).toThrow(
      BadRequestException,
    );
    expect(() => parseGraphQuery({ fromPublic: 'maybe' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects duplicate query values (arrays)', () => {
    expect(() => parseGraphQuery({ fromPublic: ['true', 'true'] })).toThrow(
      BadRequestException,
    );
  });
});
