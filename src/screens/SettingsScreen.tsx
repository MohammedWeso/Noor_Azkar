import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useTheme,
  BUILTIN_FONTS,
  ACCENT_PRESETS,
  hslToHex,
  isValidHex,
  ThemeMode,
} from '../theme/ThemeContext';
import { Card, SectionTitle } from '../components/ui';
import Slider from '../components/Slider';

const RAINBOW = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'];

export default function SettingsScreen() {
  const {
    mode,
    setMode,
    isDark,
    accent,
    setAccent,
    fontFamily,
    fontLabel,
    setBuiltinFont,
    customFontName,
    uploadCustomFont,
    removeCustomFont,
    fontScale,
    setFontScale,
    colors,
    fs,
    resetAllData,
  } = useTheme();

  const [hue, setHue] = useState(0.42);
  const [hexInput, setHexInput] = useState(accent);
  const [fontMsg, setFontMsg] = useState('');
  const [resetArmed, setResetArmed] = useState(false);

  useEffect(() => {
    setHexInput(accent);
  }, [accent]);

  useEffect(() => {
    if (!fontMsg) return;
    const t = setTimeout(() => setFontMsg(''), 3000);
    return () => clearTimeout(t);
  }, [fontMsg]);

  const applyHue = (v: number) => {
    setHue(v);
    setAccent(hslToHex(v * 360, 0.72, isDark ? 0.52 : 0.42));
  };

  const applyHex = () => {
    let v = hexInput.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (isValidHex(v)) setAccent(v);
    else setHexInput(accent);
  };

  const modes: { id: ThemeMode; label: string; icon: string }[] = [
    { id: 'light', label: 'فاتح', icon: 'sunny' },
    { id: 'dark', label: 'داكن', icon: 'moon' },
    { id: 'system', label: 'تلقائي', icon: 'phone-portrait' },
  ];

  const doUpload = async () => {
    setFontMsg('جارٍ فتح ملف الخط...');
    const res = await uploadCustomFont();
    setFontMsg(res.message);
  };

  const doReset = () => {
    if (!resetArmed) {
      setResetArmed(true);
      setTimeout(() => setResetArmed(false), 3500);
      return;
    }
    resetAllData();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: fs(20), fontWeight: '800', color: colors.text, fontFamily, marginBottom: 16 }}>
        الضبط والتخصيص
      </Text>

      {/* appearance mode */}
      <Card style={{ marginBottom: 14 }}>
        <SectionTitle icon="contrast" title="مظهر التطبيق" />
        <View style={{ flexDirection: 'row', backgroundColor: colors.input, borderRadius: 14, padding: 4 }}>
          {modes.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => setMode(m.id)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                borderRadius: 11,
                backgroundColor: mode === m.id ? colors.accent : 'transparent',
              }}
            >
              <Ionicons
                name={m.icon as any}
                size={14}
                color={mode === m.id ? '#FFFFFF' : colors.sub}
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  fontSize: fs(13),
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
      </Card>

      {/* accent color */}
      <Card style={{ marginBottom: 14 }}>
        <SectionTitle icon="color-palette" title="اللون الرئيسي" />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 15,
              backgroundColor: accent,
              borderWidth: 2,
              borderColor: colors.border,
            }}
          />
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={{ fontSize: fs(13), fontWeight: '700', color: colors.text, fontFamily }}>
              لونك المخصص
            </Text>
            <Text style={{ fontSize: fs(11.5), color: colors.sub, fontFamily }} dir="ltr">
              {accent}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {ACCENT_PRESETS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setAccent(c)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 13,
                backgroundColor: c,
                margin: 5,
                borderWidth: accent.toUpperCase() === c ? 3 : 1,
                borderColor: accent.toUpperCase() === c ? colors.text : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {accent.toUpperCase() === c ? <Ionicons name="checkmark" size={18} color="#FFFFFF" /> : null}
            </Pressable>
          ))}
        </View>

        <Text style={{ fontSize: fs(12.5), fontWeight: '700', color: colors.sub, fontFamily, marginBottom: 8 }}>
          أو اختر أي درجة لون بنفسك
        </Text>
        <Slider value={hue} onChange={applyHue} trackGradient={RAINBOW} height={18} thumbColor="#FFFFFF" />

        <View style={{ flexDirection: 'row', marginTop: 14 }}>
          <TextInput
            value={hexInput}
            onChangeText={setHexInput}
            onEndEditing={applyHex}
            onSubmitEditing={applyHex}
            autoCapitalize="characters"
            placeholder="#0FA06F"
            placeholderTextColor={colors.faint}
            style={{
              flex: 1,
              backgroundColor: colors.input,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: fs(14),
              color: colors.text,
              fontFamily,
              borderWidth: 1,
              borderColor: colors.border,
              textAlign: 'left',
            }}
            dir="ltr"
          />
          <Pressable
            onPress={applyHex}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 12,
              paddingHorizontal: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: fs(13), fontWeight: '800', fontFamily }}>تطبيق</Text>
          </Pressable>
        </View>
      </Card>

      {/* fonts */}
      <Card style={{ marginBottom: 14 }}>
        <SectionTitle icon="text" title="خط التطبيق" />

        <View
          style={{
            backgroundColor: colors.accentSoft,
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: fs(22), color: colors.text, fontFamily: fontFamily, textAlign: 'center' }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
          <Text style={{ fontSize: fs(11.5), color: colors.sub, fontFamily, marginTop: 8 }}>
            الخط الحالي: {fontLabel}
          </Text>
        </View>

        {/* upload custom font */}
        <Pressable
          onPress={doUpload}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: colors.accent,
            borderStyle: 'dashed',
            borderRadius: 14,
            paddingVertical: 13,
            backgroundColor: colors.cardAlt,
            marginBottom: 10,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="cloud-upload" size={18} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: fs(13.5), fontWeight: '700', color: colors.accent, fontFamily }}>
            رفع خط من جهازي (TTF / OTF / WOFF)
          </Text>
        </Pressable>
        {fontMsg ? (
          <Text style={{ fontSize: fs(12), color: colors.accent, fontFamily, textAlign: 'center', marginBottom: 8 }}>
            {fontMsg}
          </Text>
        ) : null}
        {customFontName ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.input,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 9,
              marginBottom: 12,
            }}
          >
            <Ionicons name="document-text" size={15} color={colors.accent} style={{ marginRight: 7 }} />
            <Text numberOfLines={1} style={{ flex: 1, fontSize: fs(12.5), color: colors.text, fontFamily }}>
              خط مخصص: {customFontName}
            </Text>
            <Pressable onPress={removeCustomFont} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </Pressable>
          </View>
        ) : null}

        {/* builtin fonts */}
        {BUILTIN_FONTS.map((f) => {
          const active = fontFamily === f.family;
          return (
            <Pressable
              key={f.family}
              onPress={() => setBuiltinFont(f)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 11,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={active ? colors.accent : colors.faint}
                style={{ marginRight: 10 }}
              />
              <Text style={{ width: 84, fontSize: fs(12.5), fontWeight: '700', color: colors.sub, fontFamily }}>
                {f.label}
              </Text>
              <Text style={{ flex: 1, fontSize: fs(16), color: colors.text, fontFamily: f.family }}>
                الحمد لله رب العالمين
              </Text>
            </Pressable>
          );
        })}

        {/* font size */}
        <Text style={{ fontSize: fs(12.5), fontWeight: '700', color: colors.sub, fontFamily, marginTop: 16, marginBottom: 6 }}>
          حجم النص: {Math.round(fontScale * 100)}%
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.faint, fontFamily }}>أ</Text>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Slider
              value={(fontScale - 0.85) / 0.5}
              onChange={(v) => setFontScale(0.85 + v * 0.5)}
              trackColor={colors.input}
              thumbColor={colors.accent}
              height={10}
            />
          </View>
          <Text style={{ fontSize: 22, color: colors.faint, fontFamily }}>أ</Text>
        </View>
      </Card>

      {/* data */}
      <Card style={{ marginBottom: 14 }}>
        <SectionTitle icon="file-tray" title="البيانات" />
        <Pressable
          onPress={doReset}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: resetArmed ? colors.danger : colors.input,
            borderRadius: 14,
            paddingVertical: 13,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Ionicons name="trash" size={16} color={resetArmed ? '#FFFFFF' : colors.danger} style={{ marginRight: 7 }} />
          <Text
            style={{
              fontSize: fs(13.5),
              fontWeight: '700',
              color: resetArmed ? '#FFFFFF' : colors.danger,
              fontFamily,
            }}
          >
            {resetArmed ? 'اضغط مرة أخرى للتأكيد' : 'مسح كل البيانات والبدء من جديد'}
          </Text>
        </Pressable>
      </Card>

      {/* about */}
      <LinearGradient
        colors={[colors.card, colors.cardAlt]}
        style={{ borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.border }}
      >
        <Text style={{ fontSize: fs(16), fontWeight: '800', color: colors.text, fontFamily, textAlign: 'center' }}>
          نور — رفيق المسلم اليومي 🕌
        </Text>
        <Text
          style={{
            fontSize: fs(12.5),
            color: colors.sub,
            fontFamily,
            textAlign: 'center',
            marginTop: 8,
            lineHeight: fs(21),
          }}
        >
          تسبيح وعدادات، أدعية وأذكار، تلاوات بأصوات كبار المشايخ، ومنبهات بأصوات حقيقية — أذان
          وتكبيرات وآيات قرآنية. مع وضعين فاتح وداكن، ولون وخط من اختيارك.
        </Text>
        <Text style={{ fontSize: fs(11.5), color: colors.gold, fontFamily, textAlign: 'center', marginTop: 10 }}>
          ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}
