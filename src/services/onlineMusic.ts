import type { OnlineTrack } from '../types';
const SEARCH_URL = 'https://itunes.apple.com/search';

interface ItunesResult {
  trackId: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
}

interface ItunesResponse {
  resultCount: number;
  results: ItunesResult[];
}

function higherResArtwork(url?: string): string | null {
  if (!url) {
    return null;
  }
  return url.replace('100x100bb', '300x300bb');
}

export async function searchOnlineTracks(
  query: string,
  limit = 25,
): Promise<OnlineTrack[]> {
  const q = query.trim();
  if (!q) {
    return [];
  }
  const url = `${SEARCH_URL}?term=${encodeURIComponent(q)}&media=music&entity=song&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Search failed (${res.status})`);
  }
  const data: ItunesResponse = await res.json();
  return data.results
    .filter(r => !!r.previewUrl && !!r.trackName)
    .map(r => ({
      id: `online:${r.trackId}`,
      title: r.trackName!,
      artist: r.artistName ?? 'Unknown artist',
      album: r.collectionName ?? null,
      artwork: higherResArtwork(r.artworkUrl100),
      previewUrl: r.previewUrl!,
      durationMs: r.trackTimeMillis ?? 30000,
    }));
}
