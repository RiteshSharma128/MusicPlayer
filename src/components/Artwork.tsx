import React, { useEffect, useState, useMemo } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { useColors, type Palette } from '../theme';

interface Props {
  uri?: string | null;
  size: number;
  radius?: number;
  round?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Artwork({ uri, size, radius = 8, round = false, style }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const borderRadius = round ? size / 2 : radius;
  const box = { width: size, height: size, borderRadius };

  if (!uri || failed) {
    return (
      <View style={[styles.placeholder, box, style]}>
        <Icon name="music" size={size * 0.45} color={colors.textDim} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[box, style as object]}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
