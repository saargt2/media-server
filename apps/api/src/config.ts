import { env } from './env';
import { ConfigSchema, type Config } from '@media-server/shared';

let config: Config | null = null;

export function loadConfig(): Config {
  if (config) return config;

  const result = ConfigSchema.safeParse({
    tmdbApiKey: env.TMDB_API_KEY,
    qbittorrentUrl: env.QBITTORRENT_URL,
    qbittorrentPort: env.QBITTORRENT_PORT,
    qbittorrentUsername: env.QBITTORRENT_USERNAME,
    qbittorrentPassword: env.QBITTORRENT_PASSWORD,
    prowlarrUrl: env.PROWLARR_URL,
    prowlarrPort: env.PROWLARR_PORT,
    prowlarrApiKey: env.PROWLARR_API_KEY,
    mediaPath: env.MEDIA_PATH,
    tvPath: env.TV_PATH,
    moviePath: env.MOVIE_PATH,
    defaultSeedLimit: env.DEFAULT_SEED_LIMIT,
    defaultSeedTimeLimit: env.DEFAULT_SEED_TIME_LIMIT,
    maxMediaSizeBytes: env.MAX_MEDIA_SIZE_BYTES,
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Config validation failed:\n${issues}`);
  }

  config = result.data;
  return config;
}

export function getConfig(): Config {
  if (!config) throw new Error('Config not loaded. Call loadConfig() first.');
  return config;
}
