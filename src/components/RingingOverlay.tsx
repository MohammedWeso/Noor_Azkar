import React, { useEffect } from 'react';
import { Modal, Text, View, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useAlarms, SNOOZE_MINUTES } from '../context/AlarmContext';
import { useTheme } from '../theme/ThemeContext';
import { format12, pad2 } from '../lib/utils';
import { shade } from '../theme/ThemeContext';

export default function RingingOverlay() {
  const { ringing, dismissRinging, snoozeRinging } = useAlarms();
  const { colors, fontFamily, fs, accent } = useTheme();

  const bell = useSharedValue(1);
  const ring1 = useSharedValue(0.6);
  const ring2 = useSharedValue(0.6);
  const ringOpacity1 = useSharedValue(0.5);
  const ringOpacity2 = useSharedValue(0.5);

  useEffect(() => {
    if (ringing) {
      bell.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 450 }),
          withTiming(0.96, { duration: 450 }),
          withTiming(1, { duration: 200 })
        ),
        -1,
        false
      );
      ring1.value = 0.7;
      ringOpacity1.value = 0.55;
      ring1.value = withRepeat(
        withSequence(withDelay(100, withTiming(1.9, { duration: 1400 })), withTiming(0.7, { duration: 0 })),
        -1,
        false
      );
      ringOpacity1.value = withRepeat(
        withSequence(withDelay(100, withTiming(0, { duration: 1400 })), withTiming(0.55, { duration: 0 })),
        -1,
        false
      );
      ring2.value = withRepeat(
        withSequence(withDelay(800, withTiming(1.9, { duration: 1400 })), withTiming(0.7, { duration: 0 })),
        -1,
        false
      );
      ringOpacity2.value = withRepeat(
        withSequence(withDelay(800, withTiming(0, { duration: 1400 })), withTiming(0.55, { duration: 0 })),
        -1,
        false
      );
    } else {
      bell.value = withTiming(1, { duration: 150 });
    }
  }, [ringing, bell, ring1, ring2, ringOpacity1, ringOpacity2]);

  const bellStyle = useAnimatedStyle(() => ({ transform: [{ scale: bell.value }] }));
  const ringStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: ring1.value }],
    opacity: ringOpacity1.value,
  }));
  const ringStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: ring2.value }],
    opacity: ringOpacity2.value,
  }));

  return (
    <Modal visible={!!ringing} transparent animationType="fade" statusBarTranslucent>
      <LinearGradient
        colors={[shade(accent, -0.6), shade(accent, -0.35), shade(accent, -0.65)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}
      >
        {ringing ? (
          <>
            <View style={{ alignItems: 'center', marginBottom: 34 }}>
              <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.View
                  style={[
                    ringStyle1,
                    {
                      position: 'absolute',
                      width: 170,
                      height: 170,
                      borderRadius: 85,
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.8)',
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    ringStyle2,
                    {
                      position: 'absolute',
                      width: 170,
                      height: 170,
                      borderRadius: 85,
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.8)',
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    bellStyle,
                    {
                      width: 150,
                      height: 150,
                      borderRadius: 75,
                      backgroundColor: 'rgba(255,255,255,0.14)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.35)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}
                >
                  <Ionicons name="notifications" size={62} color="#FFFFFF" />
                </Animated.View>
              </View>
            </View>

            <Text
              style={{
                fontSize: fs(44),
                fontWeight: '800',
                color: '#FFFFFF',
                fontFamily,
                textAlign: 'center',
              }}
            >
              {format12(ringing.alarm.hour24, ringing.alarm.minute)}
            </Text>
            <Text
              style={{
                fontSize: fs(20),
                fontWeight: '700',
                color: '#FFFFFF',
                fontFamily,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {ringing.alarm.label || 'المنبه'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
                backgroundColor: 'rgba(255,255,255,0.14)',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
              }}
            >
              <Ionicons name="volume-high" size={15} color="#FFFFFF" style={{ marginRight: 7 }} />
              <Text style={{ fontSize: fs(13), color: '#FFFFFF', fontFamily }}>
                {ringing.sound.name}
              </Text>
            </View>

            <View style={{ marginTop: 44, width: '100%', maxWidth: 340 }}>
              <Pressable
                onPress={dismissRinging}
                style={({ pressed }) => ({
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: '#000',
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                })}
              >
                <Ionicons name="stop-circle" size={20} color={shade(accent, -0.3)} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: fs(17), fontWeight: '800', color: shade(accent, -0.35), fontFamily }}>
                  إيقاف التنبيه
                </Text>
              </Pressable>
              <Pressable
                onPress={snoozeRinging}
                style={({ pressed }) => ({
                  marginTop: 12,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.4)',
                  borderRadius: 18,
                  paddingVertical: 14,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Ionicons name="alarm" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: fs(15), fontWeight: '700', color: '#FFFFFF', fontFamily }}>
                  غفوة {SNOOZE_MINUTES} دقائق
                </Text>
              </Pressable>
            </View>

            <Text
              style={{
                position: 'absolute',
                bottom: 26,
                fontSize: fs(12),
                color: 'rgba(255,255,255,0.75)',
                fontFamily,
                textAlign: 'center',
              }}
            >
              ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾
            </Text>
          </>
        ) : (
          <View />
        )}
      </LinearGradient>
    </Modal>
  );
}
