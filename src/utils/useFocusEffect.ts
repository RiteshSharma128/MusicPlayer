import { useEffect, type EffectCallback } from 'react';
export function useFocusEffect(effect: EffectCallback) {
  useEffect(effect, [effect]);
}
