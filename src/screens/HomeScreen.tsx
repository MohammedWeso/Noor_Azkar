import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Card, SectionTitle } from '../components/ui';
import { DAILY_AYAHS, DAILY_HADITHS } from '../data/dailyData';
import {
  MAKKAH,
  PRAYER_ORDER,
  cleanTime,
  fetchPrayerTimes,
  getCurrentPosition,
  getNextPrayer,
} from '../lib/prayerTimes';
import {
  dayOfYear,
  format12,
  formatSeconds,
  gregorianToday,
  greeting,
  hijriToday,
  vibrate,
} from '../lib/utils';
import { useAlarms } from '../context/AlarmContext';

const COUNTER_KEY = '@noor/quickcounter';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { colors, fontFamily, fs, accentGradient, accent } = useTheme();
  const { nextAlarm } = useAlarms();

  const [now, setNow] = useState(new Date());
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [ptStatus, setPtStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [locLabel, setLocLabel] = useState('مكة المكرمة');
  const [counter, setCounter] = useState(0);

  /* clock tick */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* quick counter persistence */
  useEffect(() => {
    AsyncStorage.getItem(COUNTER_KEY)
      .then((v) => setCounter(v ? parseInt(v, 10) || 0 : 0))
      .catch(() => {});
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(COUNTER_KEY, String(counter)).catch(() => {});
  }, [counter]);

  const loadTimes = useCallback(async (lat: number, lng: number) => {
    setPtStatus('loading');
    try {
      const t = await fetchPrayerTimes(lat, lng);
      setTimings(t);
      setPtStatus('ok');
    } catch {
      setPtStatus('error');
    }
  }, []);

  useEffect(() => {
    (async () => {
      let usedSaved = false;
      try {
        const saved = await AsyncStorage.getItem('@noor/coords');
        if (saved) {
          const c = JSON.parse(saved);
          setLocLabel('موقعك الحالي');
          usedSaved = true;
          loadTimes(c.lat, c.lng);
        }
      } catch {}
      if (!usedSaved) loadTimes(MAKKAH.lat, MAKKAH.lng);
      try {
        const c = await getCurrentPosition();
        setLocLabel('موقعك الحالي');
        AsyncStorage.setItem('@noor/coords', JSON.stringify(c)).catch(() => {});
        loadTimes(c.lat, c.lng);
      } catch {
        /* keep Makkah fallback */
      }
    })();
  }, [loadTimes]);

  const next = useMemo(() => (timings ? getNextPrayer(timings, now) : null), [timings, now]);

  const daily = useMemo(() => {
    const d = dayOfYear();
    const isAyah = d % 2 === 0;
    const pool = isAyah ? DAILY_AYAHS : DAILY_HADITHS;
    return { isAyah, item: pool[d % pool.length] };
  }, []);

  const quickActions = [
    { icon: 'sparkles', label: 'التسبيح', tab: 'Tasbih' },
    { icon: 'book', label: 'الأدعية', tab: 'Duas' },
    { icon: 'musical-notes', label: 'الأصوات', tab: 'Sounds' },
    { icon: 'alarm', label: 'المنبه', tab: 'Alarms' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 18, paddingBottom: 34 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={ptStatus === 'loading'}
          onRefresh={() => loadTimes(MAKKAH.lat, MAKKAH.lng)}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fs(24), fontWeight: '800', color: colors.text, fontFamily }}>
            {greeting()} 🌙
          </Text>
          <Text style={{ fontSize: fs(13), color: colors.accent, fontFamily, marginTop: 4, fontWeight: '700' }}>
            {hijriToday()}
          </Text>
          <Text style={{ fontSize: fs(12), color: colors.sub, fontFamily, marginTop: 2 }}>
            {gregorianToday()}
          </Text>
        </View>
        <LinearGradient
          colors={accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 26 }}>🕌</Text>
        </LinearGradient>
      </View>

      {/* daily ayah / hadith */}
      <LinearGradient
        colors={accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 22, padding: 20, marginBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Ionicons name={daily.isAyah ? 'book' : 'sparkles'} size={15} color="rgba(255,255,255,0.85)" />
          <Text
            style={{
              fontSize: fs(12),
              color: 'rgba(255,255,255,0.85)',
              fontFamily,
              fontWeight: '700',
              marginRight: 6,
            }}
          >
            {daily.isAyah ? 'آية اليوم' : 'حديث اليوم'}
          </Text>
        </View>
        <Text
          style={{
            fontSize: fs(17),
            color: '#FFFFFF',
            fontFamily,
            lineHeight: fs(30),
            textAlign: 'center',
          }}
        >
          {daily.item.text}
        </Text>
        <Text
          style={{
            fontSize: fs(12),
            color: 'rgba(255,255,255,0.8)',
            fontFamily,
            marginTop: 10,
            textAlign: 'center',
          }}
        >
          — {daily.item.ref}
        </Text>
      </LinearGradient>

      {/* prayer times */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle
          icon="time"
          title="مواقيت الصلاة"
          action={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={13} color={colors.sub} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: fs(11.5), color: colors.sub, fontFamily }}>{locLabel}</Text>
            </View>
          }
        />
        {ptStatus === 'loading' && !timings ? (
          <View style={{ paddingVertical: 26, alignItems: 'center' }}>
            <ActivityIndicator color={colors.accent} />
            <Text style={{ fontSize: fs(12), color: colors.sub, fontFamily, marginTop: 10 }}>
              جارٍ تحميل المواقيت...
            </Text>
          </View>
        ) : ptStatus === 'error' && !timings ? (
          <View style={{ paddingVertical: 18, alignItems: 'center' }}>
            <Ionicons name="cloud-offline" size={28} color={colors.faint} />
            <Text style={{ fontSize: fs(13), color: colors.sub, fontFamily, marginTop: 8, textAlign: 'center' }}>
              تعذّر جلب المواقيت — تحقق من الاتصال
            </Text>
            <Pressable
              onPress={() => loadTimes(MAKKAH.lat, MAKKAH.lng)}
              style={{
                marginTop: 12,
                backgroundColor: colors.accentSoft,
                paddingHorizontal: 18,
                paddingVertical: 9,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: fs(13), fontWeight: '700', fontFamily }}>
                إعادة المحاولة
              </Text>
            </Pressable>
          </View>
        ) : timings ? (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
              {PRAYER_ORDER.map((p) => {
                const isNext = next && next.key === p.key;
                return (
                  <View key={p.key} style={{ width: '33.33%', padding: 4 }}>
                    <View
                      style={{
                        borderRadius: 14,
                        paddingVertical: 12,
                        alignItems: 'center',
                        backgroundColor: isNext ? colors.accent : colors.cardAlt,
                        borderWidth: 1,
                        borderColor: isNext ? colors.accent : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: fs(12.5),
                          fontWeight: '700',
                          color: isNext ? '#FFFFFF' : colors.sub,
                          fontFamily,
                        }}
                      >
                        {p.ar}
                      </Text>
                      <Text
                        style={{
                          fontSize: fs(15),
                          fontWeight: '800',
                          color: isNext ? '#FFFFFF' : colors.text,
                          fontFamily,
                          marginTop: 3,
                        }}
                        dir="ltr"
                      >
                        {cleanTime(timings[p.key] || '')}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            {next ? (
              <View
                style={{
                  marginTop: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.accentSoft,
                  borderRadius: 12,
                  paddingVertical: 10,
                }}
              >
                <Ionicons name="hourglass" size={14} color={colors.accent} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: fs(13), color: colors.accent, fontFamily, fontWeight: '700' }}>
                  متبقي على {next.ar}: <Text dir="ltr">{formatSeconds(next.secondsLeft)}</Text>
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </Card>

      {/* quick actions */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {quickActions.map((a, i) => (
          <Pressable
            key={a.tab}
            onPress={() => navigation.navigate(a.tab)}
            style={({ pressed }) => ({
              flex: 1,
              marginHorizontal: 4,
              backgroundColor: colors.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              paddingVertical: 14,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                backgroundColor: colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 7,
              }}
            >
              <Ionicons name={a.icon as any} size={19} color={colors.accent} />
            </View>
            <Text style={{ fontSize: fs(11.5), fontWeight: '700', color: colors.text, fontFamily }}>
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* quick counter */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon="add-circle" title="عداد سريع" />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => {
              vibrate(10);
              setCounter((c) => Math.max(0, c - 1));
            }}
            style={({ pressed }) => ({
              width: 54,
              height: 54,
              borderRadius: 17,
              backgroundColor: colors.input,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="remove" size={26} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: fs(42), fontWeight: '800', color: colors.accent, fontFamily }}>
              {counter}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              vibrate(10);
              setCounter((c) => c + 1);
            }}
            style={({ pressed }) => ({
              width: 54,
              height: 54,
              borderRadius: 17,
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </Pressable>
        </View>
        <Pressable
          onPress={() => setCounter(0)}
          style={{ alignSelf: 'center', marginTop: 12, flexDirection: 'row', alignItems: 'center' }}
          hitSlop={8}
        >
          <Ionicons name="refresh" size={14} color={colors.sub} style={{ marginRight: 5 }} />
          <Text style={{ fontSize: fs(12.5), color: colors.sub, fontFamily }}>تصفير العداد</Text>
        </Pressable>
      </Card>

      {/* next alarm */}
      {nextAlarm ? (
        <Pressable onPress={() => navigation.navigate('Alarms')}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: colors.accentSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="alarm" size={21} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fs(14.5), fontWeight: '800', color: colors.text, fontFamily }}>
                  المنبه التالي: {nextAlarm.label || 'بدون اسم'}
                </Text>
                <Text style={{ fontSize: fs(12.5), color: colors.sub, fontFamily, marginTop: 3 }}>
                  الساعة {format12(nextAlarm.hour24, nextAlarm.minute)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.faint} />
            </View>
          </Card>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
