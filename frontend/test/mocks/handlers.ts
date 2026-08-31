import { http, HttpResponse } from 'msw';
import { smallGraph } from '../fixtures/small-graph';

export const handlers = [
  http.get('http://localhost:3000/graph', () => HttpResponse.json(smallGraph)),
];
