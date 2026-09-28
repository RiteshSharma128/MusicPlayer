import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icon';
import { sizes, useColors, type Palette } from '../theme';

export interface HeaderAction {
  icon: IconName;
  onPress: () => void;
  label: string;
}

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: HeaderAction[];
}

export function ScreenHeader({ title, subtitle, onBack, actions = [] }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityLabel="Back"
            style={styles.iconBtn}>
            <Icon name="back" />
          </Pressable>
        ) : null}
        <View style={[styles.titles, !onBack && { marginLeft: 16 }]}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {actions.map(a => (
          <Pressable
            key={a.label}
            onPress={a.onPress}
            hitSlop={8}
            accessibilityLabel={a.label}
            style={styles.iconBtn}>
            <Icon name={a.icon} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { backgroundColor: colors.bg },
  bar: {
    height: sizes.header,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  titles: { flex: 1 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.textDim, fontSize: 12, marginTop: 1 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
