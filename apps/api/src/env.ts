import { z } from 'zod';

const EnvSchema = z.object({
  TMDB_API_KEY: z.string().default(''),
  QBITTORRENT_URL: z.string().default('http://localhost'),
  QBITTORRENT_PORT: z.coerce.number().int().positive().max(65535).default(8080),
  QBITTORRENT_USERNAME: z.string().optional(),
  QBITTORRENT_PASSWORD: z.string().optional(),
  PROWLARR_URL: z.string().default('http://localhost'),
  PROWLARR_PORT: z.coerce.number().int().positive().max(65535).default(9696),
  PROWLARR_API_KEY: z.string().default(''),
  MEDIA_PATH: z.string().default('/media'),
  TV_PATH: z.string().default('TV Shows'),
  MOVIE_PATH: z.string().default('Movies'),
  DEFAULT_SEED_LIMIT: z.coerce.number().min(0).default(2.0),
  DEFAULT_SEED_TIME_LIMIT: z.coerce.number().int().min(0).default(86400),
  MAX_MEDIA_SIZE_BYTES: z.coerce.number().int().nonnegative().default(0),
});

export type Env = z.infer<typeof EnvSchema>;

export const env = EnvSchema.parse(process.env);
