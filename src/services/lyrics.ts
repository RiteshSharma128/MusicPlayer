export interface LyricLine {
  time: number; // seconds
  text: string;
}

export interface ParsedLyrics {
  synced: boolean;
  lines: LyricLine[];
  plainText: string;
}

const TIME_TAG = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

function parseLrc(raw: string): ParsedLyrics {
  const lines: LyricLine[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const tags = [...rawLine.matchAll(TIME_TAG)];
    if (tags.length === 0) {
      continue;
    }
    const text = rawLine.replace(TIME_TAG, '').trim();
    if (!text) {
      continue;
    }
    for (const tag of tags) {
      const minutes = parseInt(tag[1], 10);
      const seconds = parseInt(tag[2], 10);
      const fracRaw = tag[3] ?? '0';
      const frac = parseInt(fracRaw.padEnd(3, '0').slice(0, 3), 10) / 1000;
      lines.push({ time: minutes * 60 + seconds + frac, text });
    }
  }
  lines.sort((a, b) => a.time - b.time);
  return {
    synced: lines.length > 0,
    lines,
    plainText: lines.map(l => l.text).join('\n'),
  };
}

function lrcPathFor(audioUrl: string): string | null {
  if (!audioUrl.startsWith('file://')) {
    return null;
  }
  const dot = audioUrl.lastIndexOf('.');
  if (dot === -1) {
    return null;
  }
  return `${audioUrl.slice(0, dot)}.lrc`;
}


export async function loadLyrics(audioUrl: string): Promise<ParsedLyrics | null> {
  const lrcUrl = lrcPathFor(audioUrl);
  if (!lrcUrl) {
    return null;
  }
  try {
    const res = await fetch(lrcUrl);
    if (!res.ok) {
      return null;
    }
    const raw = await res.text();
    const parsed = parseLrc(raw);
    return parsed.lines.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function activeLyricIndex(lines: LyricLine[], position: number): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= position) {
      idx = i;
    } else {
      break;
    }
  }
  return idx;
}
