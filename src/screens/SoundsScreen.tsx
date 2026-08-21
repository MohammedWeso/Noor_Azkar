import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/ui';
import Slider from '../components/Slider';
import { SHEIKHS, SURAHS, surahUrl, Sheikh } from '../data/quranData';
import { usePlayer } from '../context/PlayerContext';
import { formatSeconds } from '../lib/utils';

export default function SoundsScreen() {
  const { colors, fontFamily, fs, accentGradient, accent } = useTheme();
  const { track, playing, loading, position, duration, playTrack, toggle, seek, skip, stop } =
    usePlayer();

  const [sheikh, setSheikh] = useState<Sheikh>(SHEIKHS[0]);
  const [query, setQuery] = useState('');

  const rotation = useSharedValue(0);
  useEffect(() => {
    if (playing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 12000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [playing, rotation]);
  const discStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const surahData = useMemo(() => {
    const q = query.trim();
    return SURAHS.map((name, i) => ({ no: i + 1, name })).filter(
      (s) => !q || s.name.includes(q) || String(s.no) === q
    );
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={surahData}
        keyExtractor={(s) => String(s.no)}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* sheikh selector */}
            <Text style={{ fontSize: fs(20), fontWeight: '800', color: colors.text, fontFamily, marginBottom: 4 }}>
              أصوات المشايخ
            </Text>
            <Text style={{ fontSize: fs(12.5), color: colors.sub, fontFamily, marginBottom: 14 }}>
              تلاوات خاشعة بأصوات كبار القُرّاء — اختر قارئك ثم سورتك
            </Text>
            <FlatList
              horizontal
              data={SHEIKHS}
              keyExtractor={(s) => s.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
              renderItem={({ item }) => {
                const active = sheikh.id === item.id;
                return (
                  <Pressable
                    onPress={() => setSheikh(item)}
                    style={({ pressed }) => ({
                      width: 132,
                      marginRight: 10,
                      borderRadius: 18,
                      padding: 14,
                      backgroundColor: active ? colors.accentSoft : colors.card,
                      borderWidth: 1.5,
                      borderColor: active ? colors.accent : colors.border,
                      alignItems: 'center',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <LinearGradient
                      colors={active ? accentGradient : [colors.input, colors.input]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 9,
                      }}
                    >
                      <Ionicons name="mic" size={22} color={active ? '#FFFFFF' : colors.sub} />
                    </LinearGradient>
                    <Text
                      numberOfLines={2}
                      style={{
                        fontSize: fs(12),
                        fontWeight: '800',
                        color: colors.text,
                        fontFamily,
                        textAlign: 'center',
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: fs(10), color: colors.sub, fontFamily, marginTop: 3 }}
                    >
                      {item.style}
                    </Text>
                  </Pressable>
                );
              }}
            />

            {/* current player */}
            {track ? (
              <Card style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Animated.View style={[discStyle]}>
                    <LinearGradient
                      colors={accentGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 3,
                        borderColor: colors.card,
                      }}
                    >
                      <Ionicons name="musical-notes" size={26} color="#FFFFFF" />
                    </LinearGradient>
                  </Animated.View>
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={{ fontSize: fs(15.5), fontWeight: '800', color: colors.text, fontFamily }}>
                      سورة {track.surahName}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: fs(12), color: colors.sub, fontFamily, marginTop: 3 }}>
                      {track.sheikhName}
                    </Text>
                  </View>
                  <Pressable onPress={stop} hitSlop={8} style={{ padding: 6 }}>
                    <Ionicons name="close-circle" size={24} color={colors.faint} />
                  </Pressable>
                </View>

                <View style={{ marginTop: 14 }}>
                  <Slider
                    value={duration > 0 ? position / duration : 0}
                    onChange={(v) => seek(v * duration)}
                    trackColor={colors.input}
                    thumbColor={colors.accent}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ fontSize: fs(11), color: colors.sub, fontFamily }} dir="ltr">
                      {formatSeconds(position)}
                    </Text>
                    <Text style={{ fontSize: fs(11), color: colors.sub, fontFamily }} dir="ltr">
                      {duration > 0 ? formatSeconds(duration) : '--:--'}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                  <Pressable onPress={() => skip(10)} hitSlop={8} style={{ padding: 10 }}>
                    <Ionicons name="play-skip-back" size={22} color={colors.text} />
                  </Pressable>
                  <Pressable
                    onPress={toggle}
                    style={({ pressed }) => ({
                      width: 58,
                      height: 58,
                      borderRadius: 29,
                      backgroundColor: colors.accent,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginHorizontal: 18,
                      opacity: pressed ? 0.8 : 1,
                      shadowColor: colors.accent,
                      shadowOpacity: 0.4,
                      shadowRadius: 10,
                      elevation: 6,
                    })}
                  >
                    <Ionicons name={loading ? 'hourglass' : playing ? 'pause' : 'play'} size={26} color="#FFFFFF" />
                  </Pressable>
                  <Pressable onPress={() => skip(-10)} hitSlop={8} style={{ padding: 10 }}>
                    <Ionicons name="play-skip-forward" size={22} color={colors.text} />
                  </Pressable>
                </View>
              </Card>
            ) : null}

            {/* surah search */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 14,
                marginBottom: 12,
              }}
            >
              <Ionicons name="search" size={18} color={colors.sub} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="ابحث عن سورة بالاسم أو الرقم..."
                placeholderTextColor={colors.faint}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  fontSize: fs(14),
                  color: colors.text,
                  fontFamily,
                }}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.faint} />
                </Pressable>
              ) : null}
            </View>
          </>
        }
        renderItem={({ item }) => {
          const isCurrent = track && track.surahNo === item.no && track.sheikhId === sheikh.id;
          const isCurrentPlaying = isCurrent && playing;
          return (
            <Pressable
              onPress={() =>
                playTrack({
                  sheikhId: sheikh.id,
                  sheikhName: sheikh.name,
                  surahNo: item.no,
                  surahName: item.name,
                  url: surahUrl(sheikh, item.no),
                })
              }
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isCurrent ? colors.accentSoft : colors.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isCurrent ? colors.accent : colors.border,
                padding: 12,
                marginBottom: 8,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: isCurrent ? colors.accent : colors.input,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: fs(13),
                    fontWeight: '800',
                    color: isCurrent ? '#FFFFFF' : colors.sub,
                    fontFamily,
                  }}
                >
                  {item.no}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: fs(15), fontWeight: '700', color: colors.text, fontFamily }}>
                {item.name}
              </Text>
              {isCurrent ? (
                <Ionicons
                  name={isCurrentPlaying ? 'volume-high' : 'pause-circle'}
                  size={22}
                  color={colors.accent}
                />
              ) : (
                <Ionicons name="play-circle-outline" size={22} color={colors.faint} />
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="search-outline" size={36} color={colors.faint} />
            <Text style={{ fontSize: fs(14), color: colors.sub, fontFamily, marginTop: 12 }}>
              لا توجد سورة بهذا الاسم
            </Text>
          </View>
        }
        ListFooterComponent={
          <Text style={{ fontSize: fs(11), color: colors.faint, fontFamily, textAlign: 'center', marginTop: 14 }}>
            التلاوات تُبث مباشرة من خوادم mp3quran.net بأصوات القُرّاء الأصلية
          </Text>
        }
      />
    </View>
  );
}
