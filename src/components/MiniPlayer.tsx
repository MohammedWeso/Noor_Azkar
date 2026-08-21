import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../theme/ThemeContext';

export default function MiniPlayer({ navigation }: { navigation: any }) {
  const { track, playing, loading, position, duration, toggle, stop } = usePlayer();
  const { colors, fontFamily, fs, accentGradient } = useTheme();

  if (!track) return null;

  const progress = duration > 0 ? Math.min(1, position / duration) : 0;

  return (
    <Pressable
      onPress={() => navigation.navigate('Sounds')}
      style={{
        marginHorizontal: 12,
        marginBottom: 6,
        marginTop: 8,
        borderRadius: 16,
        backgroundColor: colors.cardAlt,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <LinearGradient
          colors={accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: fs(14), fontWeight: '700', color: colors.text, fontFamily }}
          >
            سورة {track.surahName}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: fs(12), color: colors.sub, fontFamily }}>
            {track.sheikhName}
          </Text>
        </View>
        <Pressable
          onPress={toggle}
          hitSlop={8}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 6,
          }}
        >
          <Ionicons
            name={loading ? 'hourglass' : playing ? 'pause' : 'play'}
            size={18}
            color="#FFFFFF"
          />
        </Pressable>
        <Pressable onPress={stop} hitSlop={8} style={{ padding: 6 }}>
          <Ionicons name="close" size={20} color={colors.sub} />
        </Pressable>
      </View>
      <View style={{ height: 3, backgroundColor: colors.input }}>
        <View
          style={{
            height: 3,
            width: `${progress * 100}%`,
            backgroundColor: colors.accent,
            borderRadius: 2,
          }}
        />
      </View>
    </Pressable>
  );
}
