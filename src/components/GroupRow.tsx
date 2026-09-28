import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Artwork } from './Artwork';
import { Icon, type IconName } from './Icon';
import { sizes, useColors, type Palette } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  artwork?: string | null;
  round?: boolean;
  icon?: IconName;
  onPress: () => void;
  onLongPress?: () => void;
  onMore?: () => void;
}

function GroupRowBase({
  title,
  subtitle,
  artwork,
  round,
  icon,
  onPress,
  onLongPress,
  onMore,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: colors.surfaceHigh }}
      style={styles.row}>
      {icon ? (
        <View style={styles.iconBox}>
          <Icon name={icon} size={24} color={colors.accent} />
        </View>
      ) : (
        <Artwork uri={artwork} size={46} round={round} radius={6} />
      )}
      <View style={styles.texts}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.sub}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onMore ? (
        <Pressable hitSlop={10} onPress={onMore} style={styles.more}>
          <Icon name="more" size={22} color={colors.textDim} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export const GroupRow = memo(GroupRowBase);

const makeStyles = (colors: Palette) => StyleSheet.create({
  row: {
    height: sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 6,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, marginLeft: 12, marginRight: 8 },
  title: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sub: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  more: { padding: 10 },
});
