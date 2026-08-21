import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import { Card, Chip } from '../components/ui';
import { DUAS, DUA_CATEGORIES, Dua } from '../data/duasData';
import { copyText, shareText, vibrate } from '../lib/utils';

const FAV_KEY = '@noor/favduas';
const COUNTS_KEY = '@noor/duacounts';

export default function DuasScreen() {
  const { colors, fontFamily, fs } = useTheme();
  const [cat, setCat] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(FAV_KEY)
      .then((raw) => raw && setFavs(JSON.parse(raw)))
      .catch(() => {});
    AsyncStorage.getItem(COUNTS_KEY)
      .then((raw) => raw && setCounts(JSON.parse(raw)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(FAV_KEY, JSON.stringify(favs)).catch(() => {});
  }, [favs]);
  useEffect(() => {
    AsyncStorage.setItem(COUNTS_KEY, JSON.stringify(counts)).catch(() => {});
  }, [counts]);

  const data = useMemo(() => {
    let list: Dua[] = DUAS;
    if (showFavOnly) list = list.filter((d) => favs.includes(d.id));
    if (cat !== 'all') list = list.filter((d) => d.cat === cat);
    const q = query.trim();
    if (q) list = list.filter((d) => d.text.includes(q) || (d.source || '').includes(q));
    return list;
  }, [cat, query, showFavOnly, favs]);

  const toggleFav = (id: string) => {
    vibrate(10);
    setFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const incCount = (d: Dua) => {
    vibrate(12);
    const cur = counts[d.id] || 0;
    if (d.count && cur >= d.count) {
      setCounts((prev) => ({ ...prev, [d.id]: 0 }));
    } else {
      setCounts((prev) => ({ ...prev, [d.id]: cur + 1 }));
    }
  };

  const copy = async (d: Dua) => {
    const ok = await copyText(d.text + (d.source ? `\n${d.source}` : ''));
    if (ok) {
      setCopiedId(d.id);
      setTimeout(() => setCopiedId(null), 1600);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* search */}
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
          }}
        >
          <Ionicons name="search" size={18} color={colors.sub} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث في الأدعية..."
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
      </View>

      {/* category chips */}
      <FlatList
        horizontal
        data={[{ id: 'all', name: 'الكل', icon: 'apps' }, ...DUA_CATEGORIES]}
        keyExtractor={(c) => c.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <Chip label={item.name} icon={item.icon} active={cat === item.id} onPress={() => setCat(item.id)} />
        )}
      />

      {/* list */}
      <FlatList
        data={data}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Pressable
            onPress={() => setShowFavOnly((v) => !v)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              backgroundColor: showFavOnly ? colors.accent : colors.card,
              borderWidth: 1,
              borderColor: showFavOnly ? colors.accent : colors.border,
              borderRadius: 999,
              paddingHorizontal: 13,
              paddingVertical: 7,
              marginBottom: 12,
            }}
          >
            <Ionicons
              name={showFavOnly ? 'heart' : 'heart-outline'}
              size={13}
              color={showFavOnly ? '#FFFFFF' : colors.danger}
              style={{ marginRight: 5 }}
            />
            <Text
              style={{
                fontSize: fs(12),
                fontWeight: '700',
                color: showFavOnly ? '#FFFFFF' : colors.text,
                fontFamily,
              }}
            >
              المفضلة فقط
            </Text>
          </Pressable>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="book-outline" size={42} color={colors.faint} />
            <Text style={{ fontSize: fs(15), fontWeight: '700', color: colors.text, fontFamily, marginTop: 14 }}>
              لا توجد نتائج
            </Text>
            <Text style={{ fontSize: fs(12.5), color: colors.sub, fontFamily, marginTop: 6 }}>
              جرّب بحثًا آخر أو تصنيفًا مختلفًا
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isFav = favs.includes(item.id);
          const done = item.count && (counts[item.id] || 0) >= item.count;
          const catMeta = DUA_CATEGORIES.find((c) => c.id === item.cat);
          return (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.accentSoft,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Ionicons name={(catMeta?.icon || 'book') as any} size={11} color={colors.accent} />
                  <Text style={{ fontSize: fs(11), fontWeight: '700', color: colors.accent, fontFamily, marginRight: 5 }}>
                    {catMeta?.name}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
                {item.count ? (
                  <Pressable
                    onPress={() => incCount(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: done ? colors.success : colors.input,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <Ionicons
                      name={done ? 'checkmark-circle' : 'repeat'}
                      size={13}
                      color={done ? '#FFFFFF' : colors.accent}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={{
                        fontSize: fs(11.5),
                        fontWeight: '800',
                        color: done ? '#FFFFFF' : colors.text,
                        fontFamily,
                      }}
                    >
                      {counts[item.id] || 0}/{item.count}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <Text
                style={{
                  fontSize: fs(16.5),
                  color: colors.text,
                  fontFamily,
                  lineHeight: fs(30),
                  textAlign: 'center',
                }}
              >
                {item.text}
              </Text>

              {item.source ? (
                <Text style={{ fontSize: fs(11.5), color: colors.sub, fontFamily, marginTop: 8, textAlign: 'center' }}>
                  {item.source}
                </Text>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingTop: 12,
                }}
              >
                <Pressable onPress={() => copy(item)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 }}>
                  <Ionicons
                    name={copiedId === item.id ? 'checkmark' : 'copy-outline'}
                    size={16}
                    color={copiedId === item.id ? colors.success : colors.sub}
                  />
                  <Text style={{ fontSize: fs(11.5), color: copiedId === item.id ? colors.success : colors.sub, fontFamily, marginRight: 4 }}>
                    {copiedId === item.id ? 'تم النسخ' : 'نسخ'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => shareText(item.text)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 }}>
                  <Ionicons name="share-social-outline" size={16} color={colors.sub} />
                  <Text style={{ fontSize: fs(11.5), color: colors.sub, fontFamily, marginRight: 4 }}>مشاركة</Text>
                </Pressable>
                <Pressable onPress={() => toggleFav(item.id)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 }}>
                  <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={16} color={colors.danger} />
                </Pressable>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}
