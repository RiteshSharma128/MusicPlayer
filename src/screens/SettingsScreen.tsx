import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
   ScrollView,
} from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { Icon } from '../components/Icon';
import { ACCENTS, useColors, type AccentKey, type Palette } from '../theme';
import { useThemeStore } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';
import { restoreFromJson } from '../services/backup'; // buildBackupJson, likhana hai baad me 
import { toast } from '../services/player';
import {
  attachAudioEffects,
  detachAudioEffects,
  setBassBoostStrength,
  useEqPreset as applyEqPresetNative,
  type EqualizerInfo,
} from '../services/audioEffects';

interface Props {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const mode = useThemeStore(s => s.mode);
  const setMode = useThemeStore(s => s.setMode);
  const accentKey = useThemeStore(s => s.accentKey);
  const setAccent = useThemeStore(s => s.setAccent);
  const crossfadeEnabled = useSettingsStore(s => s.crossfadeEnabled);
  const setCrossfadeEnabled = useSettingsStore(s => s.setCrossfadeEnabled);
  const crossfadeSeconds = useSettingsStore(s => s.crossfadeSeconds);
  const setCrossfadeSeconds = useSettingsStore(s => s.setCrossfadeSeconds);
  const [effectsOn, setEffectsOn] = useState(false);
  const [eqInfo, setEqInfo] = useState<EqualizerInfo | null>(null);
  const [bassBoost, setBassBoost] = useState(0);
   const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const onToggleEffects = async (v: boolean) => {
    if (v) {
      const info = await attachAudioEffects();
      if (!info) {
        toast('Not supported on this device');
        return;
      }
      setEqInfo(info);
      setEffectsOn(true);
    } else {
      await detachAudioEffects();
      setEffectsOn(false);
      setEqInfo(null);
      setBassBoost(0);
    }
  };

  const changeBassBoost = (delta: number) => {
    const next = Math.min(100, Math.max(0, bassBoost + delta));
    setBassBoost(next);
    setBassBoostStrength(next * 10); // native range is 0-1000
  };

  const applyEqPreset = (index: number) => {
    applyEqPresetNative(index);
    toast('Preset applied');
  };


  const onExport = async () => {
  try {
    await Share.share({
      title: 'Music Player Backup',
      message: 'Music library backup created successfully.',
    });
  } catch {
    toast('Could not open share sheet');
  }
};


  const onRestore = () => {
    try {
      const result = restoreFromJson(restoreText);
      toast(
        `Restored ${result.playlistsAdded} playlist(s), ${result.favoritesAdded} favorite(s)`,
      );
      setRestoreOpen(false);
      setRestoreText('');
    } catch (e) {
      Alert.alert('Restore failed', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <View style={styles.root}>
       <ScreenHeader title="Settings" onBack={onBack} />
        <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      {/* <ScreenHeader title="Settings" onBack={onBack} /> */}

      <Section title="Appearance">
        <Row label="Dark mode">
          <Switch
            value={mode === 'dark'}
            onValueChange={v => setMode(v ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </Row>
        <Text style={styles.subLabel}>Accent color</Text>
        <View style={styles.swatchRow}>
          {(Object.keys(ACCENTS) as AccentKey[]).map(key => (
            <Pressable
              key={key}
              onPress={() => setAccent(key)}
              style={[styles.swatch, { backgroundColor: ACCENTS[key] }]}>
              {key === accentKey ? (
                <Icon name="check" size={18} color="#fff" />
              ) : null}
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Playback">
        <Row label="Crossfade">
          <Switch
            value={crossfadeEnabled}
            onValueChange={setCrossfadeEnabled}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </Row>
        {crossfadeEnabled ? (
          <View style={styles.stepperRow}>
            <Text style={styles.subLabel}>{crossfadeSeconds} seconds</Text>
            <View style={styles.stepperBtns}>
              <Pressable
                onPress={() => setCrossfadeSeconds(Math.max(2, crossfadeSeconds - 1))}
                style={styles.stepperBtn}>
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>
              <Pressable
                onPress={() => setCrossfadeSeconds(Math.min(10, crossfadeSeconds + 1))}
                style={styles.stepperBtn}>
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

      </Section>

      <Section title="Backup">
        <Pressable style={styles.actionRow} onPress={onExport}>
          <Icon name="upload" size={20} color={colors.accent} />
          <Text style={styles.actionLabel}>Export playlists & favorites</Text>
        </Pressable>
        <Pressable style={styles.actionRow} onPress={() => setRestoreOpen(true)}>
          <Icon name="download" size={20} color={colors.accent} />
          <Text style={styles.actionLabel}>Restore from backup text</Text>
        </Pressable>

      </Section>

      <Section title="Sound effects (Beta)">
        <Row label="Bass boost & equalizer">
          <Switch
            value={effectsOn}
            onValueChange={onToggleEffects}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </Row>
        {effectsOn ? (
          <>
            <View style={styles.stepperRow}>
              <Text style={styles.subLabel}>Bass boost: {bassBoost}%</Text>
              <View style={styles.stepperBtns}>
                <Pressable
                  onPress={() => changeBassBoost(-10)}
                  style={styles.stepperBtn}>
                  <Text style={styles.stepperBtnText}>−</Text>
                </Pressable>
                <Pressable
                  onPress={() => changeBassBoost(10)}
                  style={styles.stepperBtn}>
                  <Text style={styles.stepperBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
            {eqInfo && eqInfo.presets.length > 0 ? (
              <>
                <Text style={styles.subLabel}>Presets</Text>
                <View style={styles.presetRow}>
                  {eqInfo.presets.map((name, i) => (
                    <Pressable
                      key={name + i}
                      onPress={() => applyEqPreset(i)}
                      style={styles.presetChip}>
                      <Text style={styles.presetChipText}>{name}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : null}
      </Section>

      <Section title="Android Auto">

        <Text style={styles.hint}>
       Organize your music effortlessly with playlists, favorites, and smart
  library management for a seamless listening experience.
        </Text>

      </Section> 

      <Section title="About">
        <Text style={styles.hint}>
          A powerful offline music player with playlist management, favorites,
    backup & restore, audio effects, and a clean modern interface built
    for music lovers.
        </Text>
      </Section>

      <Modal
        visible={restoreOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setRestoreOpen(false)}>
        <View style={styles.dialogRoot}>
          <View style={styles.dialog}>

            <Text style={styles.dialogTitle}>
  Restore Backup
</Text>

<Text style={styles.hint}>
  Paste your backup data below to restore playlists and favorites.
</Text>

<TextInput
  value={restoreText}
  onChangeText={setRestoreText}
  multiline
  placeholder="Paste backup data here..."
  placeholderTextColor={colors.textDim}
  style={styles.textarea}
/>
            <View style={styles.dialogButtons}>
              <Pressable onPress={() => setRestoreOpen(false)} style={styles.dialogBtn}>
                <Text style={styles.dialogBtnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onRestore} style={styles.dialogBtn}>
                <Text style={[styles.dialogBtnText, { color: colors.accent }]}>
                  Restore
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    section: { paddingHorizontal: 16, paddingTop: 22 },
    sectionTitle: {
      color: colors.textDim,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginBottom: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 44,
    },
    rowLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
    subLabel: { color: colors.textDim, fontSize: 13, marginTop: 6 },
    swatchRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
    swatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    stepperBtns: { flexDirection: 'row', gap: 8 },
    stepperBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperBtnText: { color: colors.text, fontSize: 18, fontWeight: '700' },
    presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    presetChip: {
      backgroundColor: colors.surfaceHigh,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    presetChipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
    hint: {
      color: colors.textDim,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 10,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 44,
    },
    actionLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
    dialogRoot: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      padding: 24,
    },
    dialog: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
    dialogTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
    textarea: {
      color: colors.text,
      fontSize: 13,
      backgroundColor: colors.surfaceHigh,
      borderRadius: 10,
      padding: 12,
      marginTop: 10,
      height: 140,
      textAlignVertical: 'top',
    },
    dialogButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 14,
    },
    dialogBtn: { paddingHorizontal: 16, paddingVertical: 8 },
    dialogBtnText: { color: colors.textDim, fontSize: 15, fontWeight: '700' },
    scrollContent: {
  paddingBottom: 180,
},

  });
