import { z } from 'zod';

/** Standard wrapper for all API responses */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    /** Whether the request succeeded */
    success: z.boolean(),
    /** Response payload (present on success) */
    data: dataSchema.optional(),
    /** Error message (present on failure) */
    error: z.string().optional(),
  });

/** Paginated list result */
export const PaginatedResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

/** Health status of all backend services */
export const SystemStatusSchema = z.object({
  qbittorrent: z.boolean(),
  prowlarr: z.boolean(),
  plex: z.boolean(),
  diskUsage: z.object({
    total: z.number().nonnegative(),
    used: z.number().nonnegative(),
    free: z.number().nonnegative(),
    percentUsed: z.number().min(0).max(100),
  }),
});

export type SystemStatus = z.infer<typeof SystemStatusSchema>;

/** Application configuration — loaded from environment variables at startup */
export const ConfigSchema = z.object({
  tmdbApiKey: z.string().min(1),
  qbittorrentUrl: z.string().url().default('http://localhost'),
  qbittorrentPort: z.coerce.number().int().positive().max(65535).default(8080),
  qbittorrentUsername: z.string().optional(),
  qbittorrentPassword: z.string().optional(),
  prowlarrUrl: z.string().url().default('http://localhost'),
  prowlarrPort: z.coerce.number().int().positive().max(65535).default(9696),
  prowlarrApiKey: z.string().min(1),
  /** Root path where media is stored */
  mediaPath: z.string().default('/media'),
  /** Subdirectory for TV shows under mediaPath */
  tvPath: z.string().default('TV Shows'),
  /** Subdirectory for movies under mediaPath */
  moviePath: z.string().default('Movies'),
  /** Global default share ratio limit */
  defaultSeedLimit: z.coerce.number().min(0).default(2.0),
  /** Global default seeding time limit in seconds */
  defaultSeedTimeLimit: z.coerce.number().int().min(0).default(86400),
  /**
   * Maximum disk usage allowed in bytes for the media directory.
   * New downloads will be rejected once this threshold is exceeded.
   * Set to 0 to disable the limit.
   */
  maxMediaSizeBytes: z.coerce.number().int().nonnegative().default(0),
});

export type Config = z.infer<typeof ConfigSchema>;
