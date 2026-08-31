import { Controller, Get, Injectable, Query } from '@nestjs/common';
import { parseGraphQuery } from './http/parse-graph-query';
import { GraphQueryService } from './query/graph-query.service';
import { ReactFlowMapper } from './reactflow/reactflow.mapper';
import type { ReactFlowGraph } from './reactflow/reactflow.types';

@Injectable()
@Controller('graph')
export class GraphController {
  constructor(
    private readonly queryService: GraphQueryService,
    private readonly mapper: ReactFlowMapper,
  ) {}

  @Get()
  getGraph(@Query() query: Record<string, unknown>): ReactFlowGraph {
    const enabled = parseGraphQuery(query);
    return this.mapper.toReactFlow(this.queryService.query(enabled));
  }
}
