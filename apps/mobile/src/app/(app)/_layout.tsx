import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
  };
}

export default function AppLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.today'), tabBarIcon: tabIcon('sunny-outline') }}
      />
      <Tabs.Screen
        name="programs"
        options={{ title: t('tabs.programs'), tabBarIcon: tabIcon('leaf-outline') }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: t('tabs.journal'), tabBarIcon: tabIcon('book-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: tabIcon('person-circle-outline') }}
      />
    </Tabs>
  );
}
