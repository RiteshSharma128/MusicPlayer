import { NativeModules, Platform } from 'react-native';

interface EqualizerBand {
  index: number;
  centerFreqHz: number;
  level: number;
}

interface EqualizerInfo {
  bandCount: number;
  minLevel: number;
  maxLevel: number;
  bands: EqualizerBand[];
  presets: string[];
}

interface AudioEffectsNative {
  attach(): Promise<EqualizerInfo>;
  detach(): Promise<void>;
  setBassBoostStrength(strength: number): Promise<void>;
  setBandLevel(band: number, level: number): Promise<void>;
  usePreset(presetIndex: number): Promise<void>;
}

const native: AudioEffectsNative | undefined = NativeModules.AudioEffectsModule;

export const audioEffectsAvailable = Platform.OS === 'android' && !!native;
export async function attachAudioEffects(): Promise<EqualizerInfo | null> {
  if (!native) {
    return null;
  }
  try {
    return await native.attach();
  } catch {
    return null;
  }
}

export async function detachAudioEffects(): Promise<void> {
  try {
    await native?.detach();
  } catch {
    // ignore
  }
}

export async function setBassBoostStrength(strength: number): Promise<boolean> {
  try {
    await native?.setBassBoostStrength(Math.round(strength));
    return true;
  } catch {
    return false;
  }
}

export async function setEqBandLevel(band: number, level: number): Promise<boolean> {
  try {
    await native?.setBandLevel(band, Math.round(level));
    return true;
  } catch {
    return false;
  }
}

export async function useEqPreset(presetIndex: number): Promise<boolean> {
  try {
    await native?.usePreset(presetIndex);
    return true;
  } catch {
    return false;
  }
}

export type { EqualizerBand, EqualizerInfo };
