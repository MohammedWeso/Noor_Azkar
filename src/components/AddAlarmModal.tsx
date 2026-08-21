import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alarm } from '../context/AlarmContext';
import { ALARM_SOUNDS, DEFAULT_SOUND_ID } from '../data/alarmSounds';
import { previewAudio } from '../lib/audio';
import { useTheme } from '../theme/ThemeContext';
import { WEEKDAYS_SHORT, pad2 } from '../lib/utils';

interface Props {
  visible: boolean;
  initial: Alarm | null;
  onClose: () => void;
  onSave: (a: Omit<Alarm, 'id'>, id?: string) => void;
}

export default function AddAlarmModal({ visible, initial, onClose, onSave }: Props) {
  const { colors, fontFamily, fs, accentGradient } = useTheme();
  const [label, setLabel] = useState('');
  const [hour, setHour] = useState('5');
  const [minute, setMinute] = useState('00');
  const [isPM, setIsPM] = useState(true);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [soundId, setSoundId] = useState(DEFAULT_SOUND_ID);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      if (initial) {
        setLabel(initial.label);
        let h12 = initial.hour24 % 12;
        if (h12 === 0) h12 = 12;
        setHour(String(h12));
        setMinute(pad2(initial.minute));
        setIsPM(initial.hour24 >= 12);
        setDays(initial.days.length ? initial.days : [0, 1, 2, 3, 4, 5, 6]);
        setSoundId(initial.soundId);
      } else {
        setLabel('');
        setHour('5');
        setMinute('00');
        setIsPM(false);
        setDays([0, 1, 2, 3, 4, 5, 6]);
        setSoundId(DEFAULT_SOUND_ID);
      }
      setError('');
      setPreviewing(null);
    } else {
      previewAudio.stop();
      setPreviewing(null);
    }
  }, [visible, initial]);

  const toggleDay = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const togglePreview = (id: string, url: string) => {
    if (previewing === id) {
      previewAudio.stop();
      setPreviewing(null);
    } else {
      previewAudio.setSource(url, false);
      previewAudio.play();
      setPreviewing(id);
      previewAudio.on('ended', () => setPreviewing(null));
    }
  };

  const save = () => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (isNaN(h) || h < 1 || h > 12) {
      setError('الساعة يجب أن تكون بين ١ و ١٢');
      return;
    }
    if (isNaN(m) || m < 0 || m > 59) {
      setError('الدقائق يجب أن تكون بين ٠ و ٥٩');
      return;
    }
    if (days.length === 0) {
      setError('اختر يومًا واحدًا على الأقل');
      return;
    }
    const hour24 = isPM ? (h % 12) + 12 : h % 12;
    previewAudio.stop();
    onSave(
      { label: label.trim(), hour24, minute: m, days, soundId, enabled: initial ? initial.enabled : true },
      initial?.id
    );
  };

  const daysText = useMemo(() => {
    if (days.length === 7) return 'يوميًا';
    if (days.length === 0) return 'بدون أيام';
    if (days.join(',') === '1,2,3,4,5') return 'أيام الأسبوع';
    if (days.join(',') === '0,6') return 'نهاية الأسبوع';
    return days.map((d) => WEEKDAYS_SHORT[d]).join('، ');
  }, [days]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '88%',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 18,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ flex: 1, fontSize: fs(18), fontWeight: '800', color: colors.text, fontFamily }}>
              {initial ? 'تعديل المنبه' : 'منبه جديد'}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.sub} />
            </Pressable>
          </View>

          <ScrollView style={{ paddingHorizontal: 18 }} contentContainerStyle={{ paddingVertical: 18 }}>
            {/* label */}
            <Text style={{ fontSize: fs(13), fontWeight: '700', color: colors.sub, fontFamily, marginBottom: 8 }}>
              اسم المنبه
            </Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="مثال: صلاة الفجر، ورد الصباح..."
              placeholderTextColor={colors.faint}
              maxLength={40}
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

            {/* time */}
            <Text
              style={{ fontSize: fs(13), fontWeight: '700', color: colors.sub, fontFamily, marginTop: 20, marginBottom: 8 }}
            >
              الوقت
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.input,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: 8,
                }}
              >
                <TextInput
                  value={hour}
                  onChangeText={(t) => setHour(t.replace(/[^0-9]/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  style={{
                    fontSize: fs(34),
                    fontWeight: '800',
                    color: colors.text,
                    fontFamily,
                    textAlign: 'center',
                    width: 64,
                  }}
                />
                <Text style={{ fontSize: fs(30), fontWeight: '800', color: colors.sub, marginHorizontal: 2 }}>:</Text>
                <TextInput
                  value={minute}
                  onChangeText={(t) => setMinute(t.replace(/[^0-9]/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  style={{
                    fontSize: fs(34),
                    fontWeight: '800',
                    color: colors.text,
                    fontFamily,
                    textAlign: 'center',
                    width: 64,
                  }}
                />
              </View>
              <View style={{ marginHorizontal: 10 }}>
                <Pressable
                  onPress={() => setIsPM(false)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    backgroundColor: !isPM ? colors.accent : colors.input,
                  }}
                >
                  <Text
                    style={{
                      fontSize: fs(14),
                      fontWeight: '800',
                      color: !isPM ? '#FFFFFF' : colors.sub,
                      fontFamily,
                    }}
                  >
                    ص
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsPM(true)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    backgroundColor: isPM ? colors.accent : colors.input,
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: fs(14),
                      fontWeight: '800',
                      color: isPM ? '#FFFFFF' : colors.sub,
                      fontFamily,
                    }}
                  >
                    م
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* days */}
            <Text
              style={{ fontSize: fs(13), fontWeight: '700', color: colors.sub, fontFamily, marginTop: 20, marginBottom: 8 }}
            >
              أيام التكرار — {daysText}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {WEEKDAYS_SHORT.map((name, idx) => {
                const active = days.includes(idx);
                return (
                  <Pressable
                    key={idx}
                    onPress={() => toggleDay(idx)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: active ? colors.accent : colors.input,
                      marginRight: 7,
                      marginBottom: 7,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: fs(12.5),
                        fontWeight: '700',
                        color: active ? '#FFFFFF' : colors.text,
                        fontFamily,
                      }}
                    >
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* sound */}
            <Text
              style={{ fontSize: fs(13), fontWeight: '700', color: colors.sub, fontFamily, marginTop: 16, marginBottom: 4 }}
            >
              صوت التنبيه (تسجيلات بشرية حقيقية)
            </Text>
            <Text style={{ fontSize: fs(11.5), color: colors.faint, fontFamily, marginBottom: 10 }}>
              اضغط ▶ للاستماع قبل الحفظ
            </Text>
            {ALARM_SOUNDS.map((s) => {
              const selected = soundId === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSoundId(s.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: selected ? colors.accentSoft : colors.input,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: selected ? colors.accent : colors.border,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selected ? colors.accent : colors.faint}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fs(14), fontWeight: '700', color: colors.text, fontFamily }}>
                      {s.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: fs(11.5), color: colors.sub, fontFamily, marginTop: 2 }}
                    >
                      {s.desc}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => togglePreview(s.id, s.url)}
                    hitSlop={8}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: selected ? colors.accent : colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: selected ? colors.accent : colors.border,
                    }}
                  >
                    <Ionicons
                      name={previewing === s.id ? 'stop' : 'play'}
                      size={16}
                      color={selected ? '#FFFFFF' : colors.accent}
                    />
                  </Pressable>
                </Pressable>
              );
            })}

            {error ? (
              <Text style={{ color: colors.danger, fontSize: fs(13), fontFamily, marginTop: 6, textAlign: 'center' }}>
                {error}
              </Text>
            ) : null}

            <LinearGradient
              colors={accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, marginTop: 14 }}
            >
              <Pressable
                onPress={save}
                style={({ pressed }) => ({
                  paddingVertical: 15,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                  borderRadius: 16,
                })}
              >
                <Text style={{ color: '#FFFFFF', fontSize: fs(16), fontWeight: '800', fontFamily }}>
                  {initial ? 'حفظ التعديلات' : 'إضافة المنبه'}
                </Text>
              </Pressable>
            </LinearGradient>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
