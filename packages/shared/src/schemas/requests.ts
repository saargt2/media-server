import { z } from 'zod';

/** Payload for searching TMDB content via our API */
export const SearchQuerySchema = z.object({
  /** Free-text search string */
  query: z.string().min(1),
  /** Whether to search for TV shows or movies */
  type: z.enum(['tv', 'movie']),
  /** If provided, filters search to specific seasons */
  seasonNumbers: z.array(z.number().int().positive()).optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

/** Identifies which seasons of a TV show to download */
export const SeasonSelectionSchema = z.object({
  /** TMDB ID of the show */
  tmdbId: z.number().int().positive(),
  /** Season numbers to include (e.g. [1, 2] for seasons 1 and 2) */
  seasonNumbers: z.array(z.number().int().positive()).min(1),
});

export type SeasonSelection = z.infer<typeof SeasonSelectionSchema>;

/** Initiates a new download job */
export const DownloadRequestSchema = z.object({
  /** Media type */
  type: z.enum(['tv', 'movie']),
  /** TMDB ID of the show or movie */
  tmdbId: z.number().int().positive(),
  /** Human-readable title for display in download history */
  title: z.string().min(1),
  /** Season numbers to download (omit for movies or full-series packs) */
  seasonNumbers: z.array(z.number().int().positive()).optional(),
  /** Magnet link or .torrent URL to add to qBittorrent */
  torrentUrl: z.string().url(),
  /** qBittorrent category name */
  category: z.string().min(1),
  /** Maximum share ratio before stopping seed (0 = no limit) */
  seedLimit: z.number().min(0),
  /** Maximum seeding time in seconds before stopping (0 = no limit) */
  seedTimeLimit: z.number().int().min(0),
  /** Enable sequential download (download pieces in order) */
  sequentialDownload: z.boolean().optional(),
  /** Prioritize downloading first and last pieces first */
  firstLastPiecePriority: z.boolean().optional(),
  /**
   * Per-file priority overrides.
   * Values follow qBittorrent's TorrentFilePriority:
   * 0 = skip, 1 = normal, 6 = high, 7 = max
   */
  filePriorities: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        priority: z.number().int().min(0).max(7),
      }),
    )
    .optional(),
});

export type DownloadRequest = z.infer<typeof DownloadRequestSchema>;

/** Updates file priorities within an active torrent */
export const FilePriorityUpdateSchema = z.object({
  /** qBittorrent torrent hash */
  hash: z.string().length(40),
  /** File index to priority mappings */
  priorities: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      priority: z.number().int().min(0).max(7),
    }),
  ),
});

export type FilePriorityUpdate = z.infer<typeof FilePriorityUpdateSchema>;

/** Adjusts seed limits on an active torrent */
export const DownloadLimitUpdateSchema = z.object({
  /** New share ratio limit (omit to leave unchanged) */
  seedLimit: z.number().min(0).optional(),
  /** New seeding time limit in seconds (omit to leave unchanged) */
  seedTimeLimit: z.number().int().min(0).optional(),
});

export type DownloadLimitUpdate = z.infer<typeof DownloadLimitUpdateSchema>;
