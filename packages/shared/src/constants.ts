/** Base path for all API routes */
export const API_PREFIX = '/api';

/** qBittorrent category names for TV and movie downloads */
export const CATEGORIES = {
  TV: 'tv',
  MOVIES: 'movies',
} as const;

/** Default share ratio at which seeding stops (2.0 = 200%) */
export const DEFAULT_SEED_LIMIT = 2.0;

/** Default max seeding time in seconds (24 hours) */
export const DEFAULT_SEED_TIME_LIMIT = 24 * 60 * 60;

/** Plex library directory name for TV shows */
export const PLEX_TV_PATH = 'TV Shows';

/** Plex library directory name for movies */
export const PLEX_MOVIE_PATH = 'Movies';
