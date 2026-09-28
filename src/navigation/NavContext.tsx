import { createContext, useContext } from 'react';
import type { SmartListKey } from '../types';

export type TabKey = 'songs' | 'albums' | 'artists' | 'playlists' | 'online';

export type StackRoute =
  | { kind: 'album'; id: string }
  | { kind: 'artist'; id: string }
  | { kind: 'playlist'; id: string }
  | { kind: 'smart'; list: SmartListKey }
  | { kind: 'search' }
  | { kind: 'folders' }
  | { kind: 'folder'; path: string }
  | { kind: 'settings' };

export interface Nav {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
  push: (route: StackRoute) => void;
  pop: () => void;
  openPlayer: () => void;
}

export const NavContext = createContext<Nav | null>(null);

export function useNav(): Nav {
  const nav = useContext(NavContext);
  if (!nav) {
    throw new Error('useNav must be used inside <Navigator>');
  }
  return nav;
}
