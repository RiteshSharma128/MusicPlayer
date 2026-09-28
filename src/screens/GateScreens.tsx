import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon } from '../components/Icon';
import { useColors, type Palette } from '../theme';
import { useLibraryStore } from '../store/libraryStore';

export function PermissionScreen({ blocked }: { blocked: boolean }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const requestPermission = useLibraryStore(s => s.requestPermission);
  return (
    <View style={styles.center}>
      <View style={styles.badge}>
        <Icon name="music" size={44} color={colors.accent} />
      </View>
      <Text style={styles.title}>Play music from your phone</Text>
      <Text style={styles.body}>
        Allow access to audio files so the app can find the songs stored on
        this device. Everything stays offline — nothing is uploaded.
      </Text>
      {blocked ? (
        <>
          <Text style={styles.hint}>
            Permission was turned off. Enable "Music and audio" in the app
            settings.
          </Text>
          <Pressable onPress={() => Linking.openSettings()} style={styles.btn}>
            <Text style={styles.btnText}>Open settings</Text>
          </Pressable>
        </>
      ) : (
        <Pressable onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Allow access</Text>
        </Pressable>
      )}
    </View>
  );
}

export function LoadingScreen({ label = 'Scanning your music…' }: { label?: string }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.body, { marginTop: 16 }]}>{label}</Text>
    </View>
  );
}

export function ErrorScreen({ message }: { message: string | null }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const load = useLibraryStore(s => s.load);
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Couldn't read your music</Text>
      <Text style={styles.body}>{message ?? 'Unknown error'}</Text>
      <Pressable onPress={() => load()} style={styles.btn}>
        <Text style={styles.btnText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
  },
  hint: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
  btn: {
    marginTop: 26,
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#0A0A0F', fontSize: 16, fontWeight: '800' },
});
