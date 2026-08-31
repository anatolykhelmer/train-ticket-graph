import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { join } from 'node:path';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('GraphController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.GRAPH_JSON_PATH = join(
      __dirname,
      'fixtures',
      'small-graph.json',
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

  it('GET /graph returns a React Flow graph', async () => {
    const res = await request(app.getHttpServer()).get('/graph').expect(200);
    expect(Array.isArray(res.body.nodes)).toBe(true);
    expect(Array.isArray(res.body.edges)).toBe(true);
    expect(res.body.nodes.map((n: { id: string }) => n.id).sort()).toEqual([
      'frontend',
      'isolated',
      'order-service',
      'prod-postgresdb',
    ]);
    const frontend = res.body.nodes.find(
      (n: { id: string }) => n.id === 'frontend',
    );
    expect(frontend.position).toEqual(
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      }),
    );
  });

  it('GET /graph with all filters returns the attack path only', async () => {
    const res = await request(app.getHttpServer())
      .get('/graph')
      .query({
        fromPublic: 'true',
        toSink: 'true',
        hasVulnerability: 'true',
      })
      .expect(200);
    const ids = res.body.nodes.map((n: { id: string }) => n.id).sort();
    expect(ids).toEqual(['frontend', 'order-service', 'prod-postgresdb']);
    expect(ids).not.toContain('isolated');
  });

  it('GET /graph?nope=true returns 400', async () => {
    await request(app.getHttpServer()).get('/graph?nope=true').expect(400);
  });
});
