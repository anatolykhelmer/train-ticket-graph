import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { join } from 'node:path';
import { FilterRegistry } from './filters/filter.registry';
import { FromPublicFilter } from './filters/from-public.filter';
import { HasVulnerabilityFilter } from './filters/has-vulnerability.filter';
import { ToSinkFilter } from './filters/to-sink.filter';
import { GraphController } from './graph.controller';
import { GraphStore } from './graph.store';
import { GraphLoader } from './loader/graph.loader';
import { PathFinder } from './pathfinding/path-finder';
import { GraphQueryService } from './query/graph-query.service';
import { ReactFlowMapper } from './reactflow/reactflow.mapper';

@Module({
  controllers: [GraphController],
  providers: [
    {
      provide: GraphLoader,
      useFactory: () => {
        const logger = new Logger(GraphLoader.name);
        return new GraphLoader((message) => logger.warn(message));
      },
    },
    GraphStore,
    PathFinder,
    FromPublicFilter,
    ToSinkFilter,
    HasVulnerabilityFilter,
    FilterRegistry,
    GraphQueryService,
    ReactFlowMapper,
  ],
})
export class GraphModule implements OnModuleInit {
  constructor(
    private readonly loader: GraphLoader,
    private readonly store: GraphStore,
  ) {}

  onModuleInit(): void {
    const filePath =
      process.env.GRAPH_JSON_PATH ??
      join(process.cwd(), 'data', 'train-ticket-be.json');
    this.store.setGraph(this.loader.loadFile(filePath));
  }
}
