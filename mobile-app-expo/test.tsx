import React from 'react';
import Animated, { useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import { View } from 'react-native';
export const Test = () => {
  const sv = useSharedValue(0);
  const animatedProps = useAnimatedProps(() => ({
    pointerEvents: sv.value > 0 ? 'auto' as const : 'none' as const,
  }));
  return <Animated.View animatedProps={animatedProps} />;
};
