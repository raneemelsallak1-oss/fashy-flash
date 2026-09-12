import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LayoutGrid, Sparkles } from 'lucide-react-native';

import { palette } from '@/lib/theme';

export default function TabLayout() {
  return (
    <>
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` prop is a string enum ('dark' | 'light' | 'auto'), not a React Native style object. */}
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: palette.ivory },
          tabBarStyle: {
            backgroundColor: palette.ivory,
            borderTopColor: palette.sandSoft,
            elevation: 0,
            shadowColor: palette.charcoal,
            shadowOpacity: 0,
            shadowRadius: 0,
          },
          tabBarActiveTintColor: palette.blush,
          tabBarInactiveTintColor: palette.muted,
          tabBarLabelStyle: { fontSize: 11, letterSpacing: 0.4 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Studio',
            tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size ?? 22} />,
          }}
        />
        <Tabs.Screen
          name="projects"
          options={{
            title: 'Projects',
            tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size ?? 22} />,
          }}
        />
      </Tabs>
    </>
  );
}
