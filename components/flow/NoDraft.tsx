import { View } from 'react-native';
import { router } from 'expo-router';
import { Text } from 'heroui-native';

import { PrimaryButton, SecondaryButton } from '@/components/ui/ActionButton';
import { useAppStore } from '@/lib/store';

/**
 * Shown when a creation screen is opened without an active draft, e.g. after a
 * web reload. Projects live in memory, so the flow has to restart.
 */
export function NoDraft() {
  const startProject = useAppStore((state) => state.startProject);

  return (
    <View className="bg-ivory flex-1 items-center justify-center gap-5 px-8">
      <View className="gap-2">
        <Text className="font-display-medium text-foreground text-center text-[22px]">
          This project session has ended
        </Text>
        <Text className="text-muted text-center text-[14px] leading-[20px]">
          Start again and your garment photos will be ready for a fresh set of visuals.
        </Text>
      </View>

      <View className="w-full gap-2">
        <PrimaryButton
          label="Start a new project"
          onPress={() => {
            startProject();
            router.replace('/create/upload');
          }}
        />
        <SecondaryButton label="Back to studio" onPress={() => router.replace('/')} />
      </View>
    </View>
  );
}
