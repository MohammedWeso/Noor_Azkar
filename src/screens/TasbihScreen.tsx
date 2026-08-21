import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Card, Chip, IconBtn, SectionTitle } from '../components/ui';
import { DHIKR_PHRASES } from '../data/dhikrData';
import { uid, vibrate } from '../lib/utils';

const STATS_KEY = '@noor/tasbihstats';
const COUNTERS_KEY = '@noor/counters';
const TARGETS = [33, 100, 500];

interface CounterItem {
  id: string;
  name: string;
  value: number;
  step: number;
}

export default function TasbihScreen() {
  const { colors, fontFamily, fs, accent } = useTheme();
  const [mode, setMode] = useState<'tasbih' | 'counter'>('tasbih');

  /* ---------------- tasbih state ---------------- */
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [targetIdx, setTargetIdx] = useState(0);
  const [autoNext, setAutoNext] = useState(true);
  const [stats, setStats] = useState<{ all: number; today: number; day: string }>({
    all: 0,
    today: 0,
    day: new Date().toDateString(),
  });

  const phrase = DHIKR_PHRASES[phraseIdx];
  const target = TARGETS[targetIdx];
  const progress = Math.min(1, count / target);

  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY)
      .then((raw) => {
        if (raw) {
          const s = JSON.parse(raw);
          if (s.day === new Date().toDateString()) setStats(s);
          else setStats({ all: s.all || 0, today: 0, day: new Date().toDateString() });
        }
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats)).catch(() => {});
  }, [stats]);

  const RING_SIZE = 250;
  const R = 112;
  const CIRC = 2 * Math.PI * R;

  const tap = () => {
    vibrate(12);
    scale.value = withSpring(0.92, { damping: 14, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    const next = count + 1;
    setCount(next);
    setStats((s) => ({ ...s, all: s.all + 1, today: s.today + 1, day: new Date().toDateString() }));
    if (next >= target) {
      vibrate([70, 40, 70, 40, 140]);
      if (autoNext) {
        setTimeout(() => {
          setCount(0);
          setPhraseIdx((i) => (i + 1) % DHIKR_PHRASES.length);
        }, 650);
      }
    }
  };

  /* ---------------- counters ---------------- */
  const [counters, setCounters] = useState<CounterItem[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStep, setNewStep] = useState(1);

  useEffect(() => {
    AsyncStorage.getItem(COUNTERS_KEY)
      .then((raw) => raw && setCounters(JSON.parse(raw)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(COUNTERS_KEY, JSON.stringify(counters)).catch(() => {});
  }, [counters]);

  const addCounter = () => {
    const name = newName.trim();
    if (!name) return;
    setCounters((prev) => [...prev, { id: uid(), name, value: 0, step: newStep }]);
    setNewName('');
    setNewStep(1);
    setAddOpen(false);
  };

  const updateCounter = (id: string, fn: (c: CounterItem) => CounterItem) => {
    setCounters((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* segmented mode */}
      <View
        style={{
          flexDirection: 'row',
          margin: 16,
          backgroundColor: colors.input,
          borderRadius: 16,
          padding: 4,
        }}
      >
        {[
          { id: 'tasbih', label: 'التسبيح', icon: 'sparkles' },
          { id: 'counter', label: 'العدادات', icon: 'calculator' },
        ].map((m) => (
          <Pressable
            key={m.id}
            onPress={() => setMode(m.id as any)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 10,
              borderRadius: 13,
              backgroundColor: mode === m.id ? colors.accent : 'transparent',
            }}
          >
            <Ionicons
              name={m.icon as any}
              size={15}
              color={mode === m.id ? '#FFFFFF' : colors.sub}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: fs(14),
                fontWeight: '700',
                color: mode === m.id ? '#FFFFFF' : colors.sub,
                fontFamily,
              }}
            >
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'tasbih' ? (
        <FlatList
          data={[0]}
          keyExtractor={() => 'body'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
          ListHeaderComponent={
            <>
              {/* phrase picker */}
              <FlatList
                horizontal
                data={DHIKR_PHRASES}
                keyExtractor={(p) => p.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 14 }}
                renderItem={({ item, index }) => (
                  <Chip
                    label={item.text.length > 26 ? item.text.slice(0, 26) + '…' : item.text}
                    active={index === phraseIdx}
                    onPress={() => {
                      setPhraseIdx(index);
                      setCount(0);
                    }}
                  />
                )}
              />
              <Text
                style={{
                  fontSize: fs(23),
                  fontWeight: '800',
                  color: colors.text,
                  fontFamily,
                  textAlign: 'center',
                  marginBottom: 4,
                }}
              >
                {phrase.text}
              </Text>
              {phrase.virtue ? (
                <Text
                  style={{
                    fontSize: fs(12),
                    color: colors.sub,
                    fontFamily,
                    textAlign: 'center',
                    marginBottom: 18,
                  }}
                >
                  ✦ {phrase.virtue}
                </Text>
              ) : (
                <View style={{ marginBottom: 18 }} />
              )}
            </>
          }
          renderItem={() => (
            <>
              {/* ring */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{ width: RING_SIZE, height: RING_SIZE }}>
                  <Svg width={RING_SIZE} height={RING_SIZE}>
                    <Circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={R}
                      stroke={colors.input}
                      strokeWidth={13}
                      fill="none"
                    />
                    <Circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={R}
                      stroke={accent}
                      strokeWidth={13}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * CIRC} ${CIRC}`}
                      transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                    />
                  </Svg>
                  <Animated.View
                    style={[
                      pressStyle,
                      {
                        position: 'absolute',
                        top: 24,
                        left: 24,
                        right: 24,
                        bottom: 24,
                        borderRadius: (RING_SIZE - 48) / 2,
                        backgroundColor: colors.accentSoft,
                        borderWidth: 1,
                        borderColor: colors.accent,
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    ]}
                  >
                    <Pressable
                      onPress={tap}
                      style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}
                    >
                      <Text style={{ fontSize: fs(52), fontWeight: '800', color: colors.accent, fontFamily }}>
                        {count}
                      </Text>
                      <Text style={{ fontSize: fs(13), color: colors.sub, fontFamily, marginTop: 2 }}>
                        من {target}
                      </Text>
                      <Text style={{ fontSize: fs(12), color: colors.faint, fontFamily, marginTop: 6 }}>
                        اضغط للتسبيح
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>
              </View>

              {/* controls */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 18 }}>
                <IconBtn name="refresh" onPress={() => setCount(0)} color={colors.sub} />
                <Pressable
                  onPress={() => setTargetIdx((i) => (i + 1) % TARGETS.length)}
                  style={({ pressed }) => ({
                    marginHorizontal: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.cardAlt,
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons name="flag" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: fs(13), fontWeight: '700', color: colors.text, fontFamily }}>
                    الهدف: {TARGETS[targetIdx]}
                  </Text>
                </Pressable>
                <IconBtn
                  name={autoNext ? 'repeat' : 'repeat-outline'}
                  onPress={() => setAutoNext((v) => !v)}
                  color={autoNext ? colors.accent : colors.sub}
                />
              </View>

              {/* stats */}
              <View style={{ flexDirection: 'row' }}>
                <Card style={{ flex: 1, marginRight: 8, alignItems: 'center', paddingVertical: 14 }}>
                  <Text style={{ fontSize: fs(12), color: colors.sub, fontFamily }}>تسبيحات اليوم</Text>
                  <Text style={{ fontSize: fs(24), fontWeight: '800', color: colors.accent, fontFamily, marginTop: 4 }}>
                    {stats.today}
                  </Text>
                </Card>
                <Card style={{ flex: 1, marginLeft: 8, alignItems: 'center', paddingVertical: 14 }}>
                  <Text style={{ fontSize: fs(12), color: colors.sub, fontFamily }}>الإجمالي</Text>
                  <Text style={{ fontSize: fs(24), fontWeight: '800', color: colors.text, fontFamily, marginTop: 4 }}>
                    {stats.all}
                  </Text>
                </Card>
              </View>
            </>
          )}
        />
      ) : (
        <FlatList
          data={counters}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Ionicons name="calculator" size={40} color={colors.faint} />
              <Text style={{ fontSize: fs(15), fontWeight: '700', color: colors.text, fontFamily, marginTop: 14 }}>
                لا توجد عدادات بعد
              </Text>
              <Text style={{ fontSize: fs(12.5), color: colors.sub, fontFamily, marginTop: 6, textAlign: 'center' }}>
                أنشئ عدادًا لأي شيء: أذكار، خطوات، مهام...
              </Text>
            </View>
          }
          ListHeaderComponent={
            <Pressable
              onPress={() => setAddOpen(true)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.accentSoft,
                borderWidth: 1.5,
                borderColor: colors.accent,
                borderStyle: 'dashed',
                borderRadius: 16,
                paddingVertical: 13,
                marginBottom: 14,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="add-circle" size={18} color={colors.accent} style={{ marginRight: 7 }} />
              <Text style={{ fontSize: fs(14), fontWeight: '700', color: colors.accent, fontFamily }}>
                إضافة عداد جديد
              </Text>
            </Pressable>
          }
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ flex: 1, fontSize: fs(15.5), fontWeight: '800', color: colors.text, fontFamily }}>
                  {item.name}
                </Text>
                <Pressable
                  onPress={() => updateCounter(item.id, (c) => ({ ...c, value: 0 }))}
                  hitSlop={8}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="refresh" size={17} color={colors.sub} />
                </Pressable>
                <Pressable
                  onPress={() => setCounters((prev) => prev.filter((c) => c.id !== item.id))}
                  hitSlop={8}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="trash" size={17} color={colors.danger} />
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable
                  onPress={() => {
                    vibrate(10);
                    updateCounter(item.id, (c) => ({ ...c, value: Math.max(0, c.value - c.step) }));
                  }}
                  style={({ pressed }) => ({
                    width: 50,
                    height: 50,
                    borderRadius: 16,
                    backgroundColor: colors.input,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons name="remove" size={24} color={colors.text} />
                </Pressable>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: fs(34), fontWeight: '800', color: colors.accent, fontFamily }}>
                    {item.value}
                  </Text>
                  <Text style={{ fontSize: fs(11), color: colors.faint, fontFamily }}>خطوة +{item.step}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    vibrate(10);
                    updateCounter(item.id, (c) => ({ ...c, value: c.value + c.step }));
                  }}
                  style={({ pressed }) => ({
                    width: 50,
                    height: 50,
                    borderRadius: 16,
                    backgroundColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </Pressable>
              </View>
            </Card>
          )}
        />
      )}

      {/* add counter modal */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
          <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setAddOpen(false)} />
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: fs(17), fontWeight: '800', color: colors.text, fontFamily, marginBottom: 14 }}>
              عداد جديد
            </Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="اسم العداد (مثال: ورد الاستغفار)"
              placeholderTextColor={colors.faint}
              autoFocus
              style={{
                backgroundColor: colors.input,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: fs(15),
                color: colors.text,
                fontFamily,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <Text style={{ fontSize: fs(13), fontWeight: '700', color: colors.sub, fontFamily, marginTop: 14, marginBottom: 8 }}>
              قيمة الخطوة
            </Text>
            <View style={{ flexDirection: 'row' }}>
              {[1, 5, 10, 33].map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setNewStep(s)}
                  style={{
                    flex: 1,
                    marginHorizontal: 4,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: newStep === s ? colors.accent : colors.input,
                  }}
                >
                  <Text
                    style={{
                      fontSize: fs(14),
                      fontWeight: '800',
                      color: newStep === s ? '#FFFFFF' : colors.text,
                      fontFamily,
                    }}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={addCounter}
              disabled={!newName.trim()}
              style={({ pressed }) => ({
                marginTop: 18,
                backgroundColor: newName.trim() ? colors.accent : colors.input,
                borderRadius: 15,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: fs(15),
                  fontWeight: '800',
                  color: newName.trim() ? '#FFFFFF' : colors.faint,
                  fontFamily,
                }}
              >
                إضافة
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
