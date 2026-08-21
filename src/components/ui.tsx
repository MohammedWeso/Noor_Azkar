import React from 'react';
import { StyleSheet, Text, View, ViewStyle, Pressable, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({
  icon,
  title,
  action,
}: {
  icon?: string;
  title: string;
  action?: React.ReactNode;
}) {
  const { colors, fs, fontFamily } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
      {icon ? (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <Ionicons name={icon as any} size={16} color={colors.accent} />
        </View>
      ) : null}
      <Text style={{ flex: 1, fontSize: fs(17), fontWeight: '700', color: colors.text, fontFamily }}>
        {title}
      </Text>
      {action}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: string;
}) {
  const { colors, fontFamily, fs } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          marginRight: 8,
          backgroundColor: active ? colors.accent : colors.card,
          borderWidth: 1,
          borderColor: active ? colors.accent : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon as any}
          size={13}
          color={active ? '#FFFFFF' : colors.sub}
          style={{ marginRight: 5 }}
        />
      ) : null}
      <Text
        style={{
          fontSize: fs(13),
          fontWeight: '600',
          color: active ? '#FFFFFF' : colors.text,
          fontFamily,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function IconBtn({
  name,
  onPress,
  color,
  size = 20,
  style,
  disabled,
}: {
  name: string;
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: size + 18,
          height: size + 18,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.cardAlt,
          opacity: pressed ? 0.7 : disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={name as any} size={size} color={color || colors.text} />
    </Pressable>
  );
}

export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  const { colors, fontFamily, fs } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      <View
        style={{
          width: 74,
          height: 74,
          borderRadius: 26,
          backgroundColor: colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon as any} size={32} color={colors.accent} />
      </View>
      <Text
        style={{
          fontSize: fs(16),
          fontWeight: '700',
          color: colors.text,
          fontFamily,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {sub ? (
        <Text
          style={{
            fontSize: fs(13),
            color: colors.sub,
            fontFamily,
            textAlign: 'center',
            marginTop: 6,
            lineHeight: fs(20),
          }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

export function LoadingView({ height = 120 }: { height?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export function Switch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: value ? colors.accent : colors.input,
        borderWidth: 1,
        borderColor: value ? colors.accent : colors.border,
        justifyContent: 'center',
        paddingHorizontal: 3,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 3,
          elevation: 2,
          alignSelf: value ? 'flex-start' : 'flex-end',
        }}
      />
    </Pressable>
  );
}

export const screenContainer = (colors: any): ViewStyle => ({
  flex: 1,
  backgroundColor: colors.bg,
});

export const contentPadding: ViewStyle = {
  paddingHorizontal: 18,
  paddingTop: 8,
  paddingBottom: 30,
};

export const styles = StyleSheet.create({});
