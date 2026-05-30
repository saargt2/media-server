import { TMDB } from 'tmdb-ts';
import { getConfig } from '../config';

let client: TMDB | null = null;

function getClient(): TMDB {
  if (!client) {
    client = new TMDB(getConfig().tmdbApiKey);
  }
  return client;
}

export function searchTVShows(query: string, page = 1) {
  return getClient().search.tvShows({ query, page });
}

export function getTVShowDetails(tmdbId: number) {
  return getClient().tvShows.details(
    tmdbId,
    ['content_ratings', 'external_ids'],
  );
}

export function getSeasonDetails(tmdbId: number, seasonNumber: number) {
  return getClient().tvSeasons.details({ tvShowID: tmdbId, seasonNumber });
}

export function searchMovies(query: string, page = 1) {
  return getClient().search.movies({ query, page });
}

export function getMovieDetails(tmdbId: number) {
  return getClient().movies.details(
    tmdbId,
    ['credits', 'external_ids', 'release_dates'],
  );
}
