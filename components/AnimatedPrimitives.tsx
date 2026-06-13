import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function FadeSlideIn({
  children,
  delay = 0,
  from = "up",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  from?: "down" | "up";
  style?: StyleProp<ViewStyle>;
}) {
  const entering =
    from === "down"
      ? FadeInDown.delay(delay).duration(500)
      : FadeInUp.delay(delay).duration(500);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      entering={ZoomIn.delay(delay).duration(400).springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

interface PressableScaleProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function PressableScale({
  onPress,
  children,
  style,
  wrapperStyle,
  disabled,
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Pressable
      style={wrapperStyle}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[animStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}
