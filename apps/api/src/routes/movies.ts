import { z } from 'zod';
import { FastifyPluginAsyncZod } from '@fastify/type-provider-zod';
import * as tmdb from '../services/tmdb';

const SearchParamsSchema = z.object({
  q: z.string().min(2).describe('Search query (min 2 characters)'),
  page: z.coerce.number().int().positive().default(1).describe('Page number'),
});

const IdParamsSchema = z.object({
  id: z.coerce.number().int().positive().describe('TMDB movie ID'),
});

const moviesRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/search', {
    schema: {
      querystring: SearchParamsSchema,
      response: {
        200: z.object({
          success: z.literal(true),
          data: z.any().describe('TMDB movie search result'),
        }),
      },
    },
  }, async (request) => {
    const result = await tmdb.searchMovies(request.query.q, request.query.page);
    return { success: true as const, data: result };
  });

  fastify.get('/:id', {
    schema: {
      params: IdParamsSchema,
      response: {
        200: z.object({
          success: z.literal(true),
          data: z.any().describe('TMDB movie details'),
        }),
        400: z.object({
          success: z.literal(false),
          error: z.string(),
        }),
      },
    },
  }, async (request) => {
    const movie = await tmdb.getMovieDetails(request.params.id);
    return { success: true as const, data: movie };
  });
};

export default moviesRoutes;
