import 'react-native-gesture-handler';
import React, { useEffect, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemeProvider, useTheme, injectGoogleFonts } from './src/theme/ThemeContext';
import { AlarmProvider } from './src/context/AlarmContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { unlockAllAudio } from './src/lib/audio';

import HomeScreen from './src/screens/HomeScreen';
import TasbihScreen from './src/screens/TasbihScreen';
import DuasScreen from './src/screens/DuasScreen';
import SoundsScreen from './src/screens/SoundsScreen';
import AlarmsScreen from './src/screens/AlarmsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import CustomTabBar from './src/components/CustomTabBar';
import RingingOverlay from './src/components/RingingOverlay';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { on: string; off: string }> = {
  Home: { on: 'home', off: 'home-outline' },
  Tasbih: { on: 'sparkles', off: 'sparkles-outline' },
  Duas: { on: 'book', off: 'book-outline' },
  Sounds: { on: 'musical-notes', off: 'musical-notes-outline' },
  Alarms: { on: 'alarm', off: 'alarm-outline' },
  Settings: { on: 'settings', off: 'settings-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Home: 'الرئيسية',
  Tasbih: 'التسبيح',
  Duas: 'الأدعية',
  Sounds: 'الأصوات',
  Alarms: 'المنبه',
  Settings: 'الضبط',
};

function AppInner() {
  const { colors, isDark, fontFamily, accent } = useTheme();

  /* RTL + document setup + google fonts + audio unlock */
  useEffect(() => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
        document.title = 'نور — رفيق المسلم';
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', colors.bg);
      }
    } catch {}
    injectGoogleFonts();

    const unlock = () => {
      unlockAllAudio();
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointerdown', unlock);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', unlock, { once: true });
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('pointerdown', unlock);
    };
  }, [colors.bg]);

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: accent,
        background: colors.bg,
        card: colors.tabBar,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [isDark, colors, accent]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: accent,
            tabBarInactiveTintColor: colors.sub,
            tabBarStyle: {
              backgroundColor: colors.tabBar,
              borderTopColor: colors.border,
              height: 64,
              paddingTop: 6,
            },
            tabBarLabelStyle: {
              fontFamily,
              fontSize: 10.5,
              fontWeight: '700',
            },
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={(focused ? TAB_ICONS[route.name].on : TAB_ICONS[route.name].off) as any}
                size={size || 22}
                color={color}
              />
            ),
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: TAB_LABELS.Home }} />
          <Tab.Screen name="Tasbih" component={TasbihScreen} options={{ title: TAB_LABELS.Tasbih }} />
          <Tab.Screen name="Duas" component={DuasScreen} options={{ title: TAB_LABELS.Duas }} />
          <Tab.Screen name="Sounds" component={SoundsScreen} options={{ title: TAB_LABELS.Sounds }} />
          <Tab.Screen name="Alarms" component={AlarmsScreen} options={{ title: TAB_LABELS.Alarms }} />
          <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: TAB_LABELS.Settings }} />
        </Tab.Navigator>
      </NavigationContainer>
      <RingingOverlay />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AlarmProvider>
            <PlayerProvider>
              <AppInner />
            </PlayerProvider>
          </AlarmProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
