import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlarms, Alarm } from '../context/AlarmContext';
import { useTheme } from '../theme/ThemeContext';
import { Card, EmptyState, Switch } from '../components/ui';
import AddAlarmModal from '../components/AddAlarmModal';
import { getSound } from '../data/alarmSounds';
import { WEEKDAYS_SHORT, format12 } from '../lib/utils';

export default function AlarmsScreen() {
  const { colors, fontFamily, fs, accentGradient } = useTheme();
  const { alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm } = useAlarms();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Alarm | null>(null);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (a: Alarm) => {
    setEditing(a);
    setModalOpen(true);
  };

  const save = (data: Omit<Alarm, 'id'>, id?: string) => {
    if (id && editing) {
      updateAlarm({ ...data, id });
    } else {
      addAlarm(data);
    }
    setModalOpen(false);
  };

  const daysLabel = (a: Alarm) => {
    if (a.days.length === 7) return 'يوميًا';
    if (a.days.join(',') === '1,2,3,4,5') return 'أيام الأسبوع';
    if (a.days.join(',') === '0,6') return 'نهاية الأسبوع';
    return a.days.map((d) => WEEKDAYS_SHORT[d]).join('، ');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={alarms}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fs(20), fontWeight: '800', color: colors.text, fontFamily }}>
                  المنبهات
                </Text>
                <Text style={{ fontSize: fs(12.5), color: colors.sub, fontFamily, marginTop: 4, lineHeight: fs(19) }}>
                  تنبيهات بأصوات حقيقية: أذان، تكبيرات، وآيات بصوت القُرّاء
                </Text>
              </View>
            </View>

            <LinearGradient
              colors={accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, marginBottom: 16, marginTop: 10 }}
            >
              <Pressable
                onPress={openAdd}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 14,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Ionicons name="add-circle" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: fs(15), fontWeight: '800', color: '#FFFFFF', fontFamily }}>
                  إضافة منبه جديد
                </Text>
              </Pressable>
            </LinearGradient>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.accentSoft,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 9,
                marginBottom: 14,
              }}
            >
              <Ionicons name="information-circle" size={15} color={colors.accent} style={{ marginRight: 7 }} />
              <Text style={{ flex: 1, fontSize: fs(11.5), color: colors.accent, fontFamily, lineHeight: fs(17) }}>
                يعمل المنبه أثناء فتح التطبيق — أبقِه مفتوحًا في وقت التنبيه
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="alarm-outline"
            title="لا توجد منبهات بعد"
            sub="أنشئ منبهك الأول بصوت الأذان أو تكبيرات العيد أو آية بصوت قارئ حقيقي"
          />
        }
        renderItem={({ item }) => {
          const sound = getSound(item.soundId);
          return (
            <Card style={{ marginBottom: 12, opacity: item.enabled ? 1 : 0.6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable onPress={() => openEdit(item)} style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={{ fontSize: fs(32), fontWeight: '800', color: colors.text, fontFamily }} dir="ltr">
                      {format12(item.hour24, item.minute)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: fs(13.5), fontWeight: '700', color: colors.accent, fontFamily, marginTop: 2 }}>
                    {item.label || 'منبه'}
                  </Text>
                  <Text style={{ fontSize: fs(11.5), color: colors.sub, fontFamily, marginTop: 4 }}>
                    {daysLabel(item)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7 }}>
                    <Ionicons name="volume-high" size={12} color={colors.faint} style={{ marginRight: 5 }} />
                    <Text numberOfLines={1} style={{ fontSize: fs(11.5), color: colors.faint, fontFamily, flex: 1 }}>
                      {sound.name}
                    </Text>
                  </View>
                </Pressable>
                <View style={{ alignItems: 'center', marginLeft: 10 }}>
                  <Switch value={item.enabled} onChange={() => toggleAlarm(item.id)} />
                  <Pressable onPress={() => deleteAlarm(item.id)} hitSlop={8} style={{ marginTop: 12, padding: 4 }}>
                    <Ionicons name="trash-outline" size={17} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            </Card>
          );
        }}
      />

      <AddAlarmModal
        visible={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={save}
      />
    </View>
  );
}
