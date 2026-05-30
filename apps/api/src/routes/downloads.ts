import { z } from 'zod';
import { FastifyPluginAsyncZod } from '@fastify/type-provider-zod';
import * as qb from '../services/qbittorrent';
import { getConfig } from '../config';
import {
  CATEGORIES,
  DEFAULT_SEED_LIMIT,
  DEFAULT_SEED_TIME_LIMIT,
  SuccessResponseSchema,
  DownloadLimitUpdateSchema,
  FilePrioritiesSchema,
} from '@media-server/shared';

const AddTorrentSchema = z.object({
  torrentUrl: z.url().describe('Magnet link or .torrent URL'),
  category: z.string().default(CATEGORIES.TV).describe('qBittorrent category'),
  savepath: z.string().optional().describe('Override download path'),
  seedLimit: z.coerce.number().min(0).default(DEFAULT_SEED_LIMIT).describe('Share ratio limit'),
  seedTimeLimit: z.coerce.number().int().min(0).default(DEFAULT_SEED_TIME_LIMIT).describe('Seeding time limit in seconds'),
  sequentialDownload: z.boolean().optional().describe('Download pieces in order'),
  firstLastPiecePriority: z.boolean().optional().describe('Prioritize first and last pieces'),
  paused: z.boolean().optional().describe('Add in paused state'),
  tags: z.string().optional().describe('Comma-separated tags'),
});

const HashParamsSchema = z.object({
  hash: z.string().length(40).describe('qBittorrent torrent hash'),
});

const downloadRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post('/', {
    schema: {
      body: AddTorrentSchema,
      response: {
        200: SuccessResponseSchema(z.object({ added: z.boolean() })),
      },
    },
  }, async (request) => {
    const config = getConfig();
    const opts = request.body;

    const defaultSavePath = opts.category === CATEGORIES.MOVIES
      ? `${config.mediaPath}/${config.moviePath}`
      : `${config.mediaPath}/${config.tvPath}`;

    const added = await qb.addTorrent(opts.torrentUrl, {
      savepath: opts.savepath ?? defaultSavePath,
      category: opts.category,
      tags: opts.tags,
      ratioLimit: opts.seedLimit,
      seedingTimeLimit: opts.seedTimeLimit,
      sequentialDownload: opts.sequentialDownload,
      firstLastPiecePrio: opts.firstLastPiecePriority,
      paused: opts.paused,
    });

    return { success: true as const, data: { added } };
  });

  fastify.get('/', {
    schema: {
      response: {
        200: SuccessResponseSchema(z.any().describe('List of torrents from qBittorrent')),
      },
    },
  }, async () => {
    const torrents = await qb.listTorrents({ includeFiles: true });
    return { success: true as const, data: torrents };
  });

  fastify.get('/:hash', {
    schema: {
      params: HashParamsSchema,
      response: {
        200: SuccessResponseSchema(z.any().describe('Torrent details from qBittorrent')),
      },
    },
  }, async (request) => {
    const torrent = await qb.getTorrent(request.params.hash);
    return { success: true as const, data: torrent };
  });

  fastify.delete('/:hash', {
    schema: {
      params: HashParamsSchema,
      querystring: z.object({
        deleteFiles: z.coerce.boolean().default(false).describe('Also delete downloaded files'),
      }),
      response: {
        200: SuccessResponseSchema(z.object({ removed: z.boolean() })),
      },
    },
  }, async (request) => {
    const removed = await qb.removeTorrent(request.params.hash, request.query.deleteFiles);
    return { success: true as const, data: { removed } };
  });

  fastify.patch('/:hash/pause', {
    schema: {
      params: HashParamsSchema,
      response: {
        200: SuccessResponseSchema(z.object({ paused: z.boolean() })),
      },
    },
  }, async (request) => {
    const paused = await qb.pauseTorrents(request.params.hash);
    return { success: true as const, data: { paused } };
  });

  fastify.patch('/:hash/resume', {
    schema: {
      params: HashParamsSchema,
      response: {
        200: SuccessResponseSchema(z.object({ resumed: z.boolean() })),
      },
    },
  }, async (request) => {
    const resumed = await qb.resumeTorrents(request.params.hash);
    return { success: true as const, data: { resumed } };
  });

  fastify.patch('/:hash/limits', {
    schema: {
      params: HashParamsSchema,
      body: DownloadLimitUpdateSchema,
      response: {
        200: SuccessResponseSchema(z.object({ updated: z.boolean() })),
      },
    },
  }, async (request) => {
    const config = getConfig();
    const body = request.body;
    const limits = {
      ratioLimit: body.seedLimit ?? config.defaultSeedLimit,
      seedingTimeLimit: body.seedTimeLimit ?? config.defaultSeedTimeLimit,
    };
    await qb.setTorrentLimits(request.params.hash, limits);
    return { success: true as const, data: { updated: true } };
  });

  fastify.patch('/:hash/priorities', {
    schema: {
      params: HashParamsSchema,
      body: z.object({ priorities: FilePrioritiesSchema }),
      response: {
        200: SuccessResponseSchema(z.object({ updated: z.boolean() })),
      },
    },
  }, async (request) => {
    const { hash } = request.params;
    const fileIds = request.body.priorities.map((p) => String(p.fileId));
    const priority = request.body.priorities[0]?.priority ?? 1;
    const updated = await qb.setFilePriority(hash, fileIds, priority as any);
    return { success: true as const, data: { updated } };
  });
};

export default downloadRoutes;
