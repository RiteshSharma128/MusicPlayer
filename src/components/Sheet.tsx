import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, type Palette } from '../theme';

interface Props {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  tall?: boolean;
 
  scroll?: boolean;
}

export function Sheet({
  visible,
  title,
  onClose,
  children,
  tall,
  scroll = true,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={styles.backdrop} />
        </Pressable>
        <View
          style={[
            styles.sheet,
            tall && styles.tall,
            { paddingBottom: insets.bottom + 8 },
          ]}>
          <View style={styles.grabber} />
          {title ? (
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          ) : null}
          {scroll ? (
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          ) : (
            <View style={styles.fill}>{children}</View>
          )}
        </View>
      </View>
    </Modal>
  );
}

interface ItemProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  selected?: boolean;
  danger?: boolean;
}

export function SheetItem({ label, onPress, icon, selected, danger }: ItemProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.surfaceHigh }}
      style={styles.item}>
      <View style={styles.itemIcon}>{icon}</View>
      <Text
        style={[
          styles.itemLabel,
          selected && { color: colors.accent },
          danger && { color: colors.danger },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '75%',
  },
  tall: { height: '75%' },
  fill: { flex: 1 },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 20,
  },
  itemIcon: { width: 36 },
  itemLabel: { color: colors.text, fontSize: 15 },
});
