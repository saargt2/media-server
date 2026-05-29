import { z } from 'zod';

/**
 * A single result from a Prowlarr/Torznab indexer search.
 * Fields follow the Torznab RSS specification conventions.
 */
export const TorrentSearchResultSchema = z.object({
  /** Release title as advertised by the indexer */
  title: z.string().min(1),
  /**
   * Unique identifier for this result from the indexer.
   * Typically a URL or hash — follows the Torznab `<guid>` element convention.
   * Not necessarily a UUID; format varies by tracker.
   */
  guid: z.string().min(1),
  /** Total size of the release in bytes */
  size: z.number().nonnegative(),
  /** Number of seeders currently sharing this release */
  seeders: z.number().int().nonnegative(),
  /** Number of leechers currently downloading this release */
  leechers: z.number().int().nonnegative(),
  /** URL to download the .torrent file or magnet link */
  downloadUrl: z.string().url(),
  /** URL to view the release details page on the indexer */
  infoUrl: z.string().url(),
  /** Name of the indexer/tracker that returned this result */
  indexer: z.string().min(1),
  /** ISO 8601 date string of when this release was published */
  publishDate: z.string(),
  /** Category labels from the indexer (e.g. ["TV", "HD"]) */
  category: z.array(z.string()),
});

export type TorrentSearchResult = z.infer<typeof TorrentSearchResultSchema>;
