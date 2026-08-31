import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { join } from 'node:path';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('GraphController real data (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.GRAPH_JSON_PATH = join(
      process.cwd(),
      'data',
      'train-ticket-be.json',
    );
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = configureApp(moduleFixture.createNestApplication());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('unfiltered graph is non-empty', async () => {
    const res = await request(app.getHttpServer()).get('/graph').expect(200);
    expect(res.body.nodes.length).toBeGreaterThan(0);
    expect(res.body.edges.length).toBeGreaterThan(0);
  });

  // This dataset has no directed route from a public node to the RDS sink:
  // the public nodes reach only admin-basic-info-service and its children,
  // while prod-postgresdb is only fed by auth-service and order-service.
  it('attack-path query is empty because no directed public route reaches the sink', async () => {
    const res = await request(app.getHttpServer())
      .get('/graph')
      .query({
        fromPublic: 'true',
        toSink: 'true',
        hasVulnerability: 'true',
      })
      .expect(200);
    expect(res.body.nodes).toEqual([]);
    expect(res.body.edges).toEqual([]);
  });
});
