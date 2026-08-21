import React from 'react';
import { View } from 'react-native';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MiniPlayer from './MiniPlayer';
import { useTheme } from '../theme/ThemeContext';

export default function CustomTabBar(props: BottomTabBarProps) {
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: colors.tabBar, borderTopWidth: 1, borderTopColor: colors.border }}>
      <MiniPlayer navigation={props.navigation} />
      <BottomTabBar {...props} />
    </View>
  );
}
