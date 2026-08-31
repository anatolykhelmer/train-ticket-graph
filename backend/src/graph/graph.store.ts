import { Injectable } from '@nestjs/common';
import { Graph } from './domain/graph.types';

@Injectable()
export class GraphStore {
  private graph: Graph | null = null;

  setGraph(graph: Graph): void {
    this.graph = graph;
  }

  getGraph(): Graph {
    if (!this.graph) {
      throw new Error('Graph has not been loaded');
    }
    return this.graph;
  }
}
