import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { brandColors, colors } from '../../components/ui/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { focused: IoniconName; unfocused: IoniconName }> = {
  pantry:  { unfocused: 'basket-outline',  focused: 'basket'  },
  scan:    { unfocused: 'scan-outline',    focused: 'scan'    },
  recipes: { unfocused: 'book-outline',    focused: 'book'    },
  profile: { unfocused: 'person-outline',  focused: 'person'  },
};

function AnimatedTabIcon({
  tab,
  color,
  focused,
  size,
}: {
  tab: string;
  color: string;
  focused: boolean;
  size: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 3,
          tension: 120,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
          tension: 100,
        }),
      ]).start();
    }
  }, [focused]);

  const icons = TAB_ICONS[tab] ?? { focused: 'ellipse', unfocused: 'ellipse-outline' };

  return (
    <Animated.View
      style={{
        width: 38,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? brandColors.lemon : 'transparent',
        borderWidth: focused ? 2 : 0,
        borderColor: brandColors.ink,
        transform: [{ scale }],
      }}
    >
      <Ionicons
        name={focused ? icons.focused : icons.unfocused}
        size={size}
        color={focused ? brandColors.ink : color}
      />
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: brandColors.ink,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: brandColors.white,
          borderTopColor: brandColors.ink,
          borderTopWidth: 3,
          minHeight: 82,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {(['pantry', 'scan', 'recipes', 'profile'] as const).map((tab) => (
        <Tabs.Screen
          key={tab}
          name={tab}
          options={{
            title: tab.charAt(0).toUpperCase() + tab.slice(1),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon tab={tab} color={color} focused={focused} size={24} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
