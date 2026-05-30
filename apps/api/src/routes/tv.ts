import { z } from 'zod';
import { FastifyPluginAsyncZod } from '@fastify/type-provider-zod';
import * as tmdb from '../services/tmdb';

const SearchParamsSchema = z.object({
  q: z.string().min(2).describe('Search query (min 2 characters)'),
  page: z.coerce.number().int().positive().default(1).describe('Page number'),
});

const IdParamsSchema = z.object({
  id: z.coerce.number().int().positive().describe('TMDB TV show ID'),
});

const SeasonParamsSchema = z.object({
  id: z.coerce.number().int().positive().describe('TMDB TV show ID'),
  season: z.coerce.number().int().positive().describe('Season number'),
});

const tvRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/search', {
    schema: {
      querystring: SearchParamsSchema,
      response: {
        200: z.object({
          success: z.literal(true),
          data: z.any().describe('TMDB search result'),
        }),
      },
    },
  }, async (request) => {
    const result = await tmdb.searchTVShows(request.query.q, request.query.page);
    return { success: true as const, data: result };
  });

  fastify.get('/:id', {
    schema: {
      params: IdParamsSchema,
      response: {
        200: z.object({
          success: z.literal(true),
          data: z.any().describe('TMDB TV show details'),
        }),
        400: z.object({
          success: z.literal(false),
          error: z.string(),
        }),
      },
    },
  }, async (request) => {
    const show = await tmdb.getTVShowDetails(request.params.id);
    return { success: true as const, data: show };
  });

  fastify.get('/:id/season/:season', {
    schema: {
      params: SeasonParamsSchema,
      response: {
        200: z.object({
          success: z.literal(true),
          data: z.any().describe('TMDB season details with episodes'),
        }),
        400: z.object({
          success: z.literal(false),
          error: z.string(),
        }),
      },
    },
  }, async (request) => {
    const details = await tmdb.getSeasonDetails(request.params.id, request.params.season);
    return { success: true as const, data: details };
  });
};

export default tvRoutes;
