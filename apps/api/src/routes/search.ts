import { z } from 'zod';
import { FastifyPluginAsyncZod } from '@fastify/type-provider-zod';
import * as prowlarr from '../services/prowlarr';
import { TorrentSearchResultSchema, SuccessResponseSchema } from '@media-server/shared';

const SearchSchema = z.object({
  query: z.string().min(1).describe('Search query (show name, movie title, etc.)'),
  type: z.enum(['tv', 'movie']).describe('Media type'),
  season: z.coerce.number().int().positive().optional().describe('Season number (for TV)'),
  episode: z.coerce.number().int().positive().optional().describe('Episode number (for TV)'),
  year: z.coerce.number().int().optional().describe('Release year (for movies)'),
});

const searchRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post('/torrents', {
    schema: {
      body: SearchSchema,
      response: {
        200: SuccessResponseSchema(z.array(TorrentSearchResultSchema)),
      },
    },
  }, async (request) => {
    const { query, type, season, episode, year } = request.body;

    let results;
    if (type === 'tv') {
      results = await prowlarr.searchTVEpisode(query, season, episode);
    } else {
      results = await prowlarr.searchMovie(query, year);
    }

    return { success: true as const, data: results };
  });
};

export default searchRoutes;
