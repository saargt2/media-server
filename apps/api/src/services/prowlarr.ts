import { getConfig } from '../config';

interface ProwlarrResult {
  title: string;
  guid: string;
  size: number;
  seeders: number;
  leechers: number;
  downloadUrl: string;
  infoUrl: string;
  indexer: string;
  publishDate: string;
  category: string[];
}

interface ProwlarrSearchOptions {
  query: string;
  categories?: number[];
  limit?: number;
  offset?: number;
}

const PROWLARR_API_PATH = '/api/v1/search';

function buildUrl(options: ProwlarrSearchOptions): string {
  const config = getConfig();
  const url = new URL(`${config.prowlarrUrl}:${config.prowlarrPort}${PROWLARR_API_PATH}`);
  url.searchParams.set('query', options.query);
  url.searchParams.set('apikey', config.prowlarrApiKey);
  url.searchParams.set('type', 'search');
  if (options.limit) url.searchParams.set('limit', String(options.limit));
  if (options.offset) url.searchParams.set('offset', String(options.offset));
  if (options.categories?.length) {
    url.searchParams.set('cat', options.categories.join(','));
  }
  return url.toString();
}

function parseProwlarrResponse(data: any): ProwlarrResult[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item: any) => ({
    title: item.title ?? '',
    guid: item.guid ?? '',
    size: item.size ?? 0,
    seeders: item.seeders ?? 0,
    leechers: item.leechers ?? 0,
    downloadUrl: item.downloadUrl ?? item.magnetUrl ?? item.infoUrl ?? '',
    infoUrl: item.infoUrl ?? '',
    indexer: item.indexer ?? item.indexerName ?? '',
    publishDate: item.publishDate ?? '',
    category: item.category ?? [],
  }));
}

export async function searchTorrents(options: ProwlarrSearchOptions): Promise<ProwlarrResult[]> {
  const url = buildUrl(options);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Prowlarr search failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return parseProwlarrResponse(data);
}

export async function searchTVEpisode(
  showName: string,
  season?: number,
  episode?: number,
): Promise<ProwlarrResult[]> {
  const query = episode
    ? `${showName} S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`
    : season
      ? `${showName} Season ${season}`
      : showName;
  return searchTorrents({ query, limit: 30 });
}

export async function searchMovie(title: string, year?: number): Promise<ProwlarrResult[]> {
  const query = year ? `${title} ${year}` : title;
  return searchTorrents({ query, limit: 30 });
}
