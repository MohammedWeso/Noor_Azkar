import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const THUMB = 24;
const IS_RTL = true; // التطبيق عربي بالكامل

interface SliderProps {
  value: number; // 0..1
  onChange: (v: number) => void;
  trackGradient?: string[];
  trackColor?: string;
  thumbColor?: string;
  height?: number;
}

export default function Slider({
  value,
  onChange,
  trackGradient,
  trackColor,
  thumbColor,
  height = 16,
}: SliderProps) {
  const [width, setWidth] = useState(0);

  const handle = (e: any) => {
    if (!width) return;
    const x = e.nativeEvent.locationX;
    let phys = Math.min(1, Math.max(0, x / width));
    const logical = IS_RTL ? 1 - phys : phys;
    onChange(logical);
  };

  const clamped = Math.min(1, Math.max(0, value));
  const physRatio = IS_RTL ? 1 - clamped : clamped;

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handle}
      onResponderMove={handle}
      style={{
        height: Math.max(height, THUMB),
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          height,
          borderRadius: height / 2,
          overflow: 'hidden',
          backgroundColor: trackColor || 'rgba(128,128,128,0.25)',
        }}
      >
        {trackGradient ? (
          <LinearGradient
            colors={trackGradient as any}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </View>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: THUMB,
          height: THUMB,
          borderRadius: THUMB / 2,
          backgroundColor: thumbColor || '#FFFFFF',
          borderWidth: 2,
          borderColor: 'rgba(0,0,0,0.12)',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
          left: width ? Math.max(0, Math.min(width - THUMB, physRatio * (width - THUMB))) : 0,
        }}
      />
    </View>
  );
}
