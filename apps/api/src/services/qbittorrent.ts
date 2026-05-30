import { QBittorrent, TorrentState, TorrentFilePriority } from '@ctrl/qbittorrent';
import { getConfig } from '../config';

let client: QBittorrent | null = null;

function getClient(): QBittorrent {
  if (!client) {
    const config = getConfig();
    client = new QBittorrent({
      baseUrl: `${config.qbittorrentUrl}:${config.qbittorrentPort}`,
      username: config.qbittorrentUsername,
      password: config.qbittorrentPassword,
    });
  }
  return client;
}

export interface TorrentAddOptions {
  savepath?: string;
  category?: string;
  tags?: string;
  ratioLimit?: number;
  seedingTimeLimit?: number;
  sequentialDownload?: boolean;
  firstLastPiecePrio?: boolean;
  paused?: boolean;
}

export async function addTorrent(
  torrentUrl: string,
  options?: TorrentAddOptions,
): Promise<boolean> {
  const qb = getClient();

  const addOptions: Record<string, any> = {};
  if (options?.savepath) addOptions.savepath = options.savepath;
  if (options?.category) addOptions.category = options.category;
  if (options?.tags) addOptions.tags = options.tags;
  if (options?.ratioLimit !== undefined) addOptions.ratioLimit = options.ratioLimit;
  if (options?.seedingTimeLimit !== undefined) addOptions.seedingTimeLimit = options.seedingTimeLimit;
  if (options?.sequentialDownload) addOptions.sequentialDownload = 'true' as const;
  if (options?.firstLastPiecePrio) addOptions.firstLastPiecePrio = 'true' as const;
  if (options?.paused) addOptions.paused = 'true' as const;

  return qb.addTorrent(torrentUrl, addOptions as any);
}

export async function listTorrents(filter?: {
  hashes?: string[];
  category?: string;
  filter?: 'all' | 'downloading' | 'seeding' | 'completed' | 'paused' | 'active' | 'inactive';
  includeFiles?: boolean;
}) {
  const qb = getClient();
  return qb.listTorrents(filter ?? {});
}

export async function getTorrent(hash: string) {
  const qb = getClient();
  return qb.getTorrent(hash);
}

export async function pauseTorrents(hashes: string | string[]) {
  const qb = getClient();
  return qb.pauseTorrent(hashes);
}

export async function resumeTorrents(hashes: string | string[]) {
  const qb = getClient();
  return qb.resumeTorrent(hashes);
}

export async function removeTorrent(hashes: string | string[], deleteFiles = false) {
  const qb = getClient();
  return qb.removeTorrent(hashes, deleteFiles);
}

export async function setFilePriority(
  hash: string,
  fileIds: string | string[],
  priority: TorrentFilePriority,
) {
  const qb = getClient();
  return qb.setFilePriority(hash, fileIds, priority);
}

export async function setTorrentLimits(
  hash: string,
  limits: { ratioLimit?: number; seedingTimeLimit?: number },
) {
  const qb = getClient();
  const body = new URLSearchParams({ hash });
  if (limits.ratioLimit !== undefined) body.set('ratioLimit', String(limits.ratioLimit));
  if (limits.seedingTimeLimit !== undefined) body.set('seedingTimeLimit', String(limits.seedingTimeLimit));
  return qb.request(`/api/v2/torrents/setShareLimits`, 'POST', {}, body);
}

export { TorrentState, TorrentFilePriority };
