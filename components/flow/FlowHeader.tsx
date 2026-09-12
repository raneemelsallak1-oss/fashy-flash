import { View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';

import { StepProgress } from '@/components/flow/StepProgress';
import { Tappable } from '@/components/ui/Tappable';
import { goBackOrReplace } from '@/lib/navigation';
import { palette } from '@/lib/theme';
import type { FlowStep } from '@/lib/types';

type FlowHeaderProps = {
  step: FlowStep;
  showBack?: boolean;
  onExit?: () => void;
};

/** Shared creation-flow header: back, exit, and the always-visible step progress. */
export function FlowHeader({ step, showBack = true, onExit }: FlowHeaderProps) {
  const exit = () => {
    if (onExit) {
      onExit();
      return;
    }
    router.dismissTo('/');
  };

  return (
    <View className="border-border/70 bg-ivory pt-safe-offset-2 border-b px-5 pb-3">
      <View className="mb-3 h-9 flex-row items-center justify-between">
        {showBack ? (
          <Tappable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="bg-surface border-border h-9 w-9 items-center justify-center rounded-full border"
            onPress={() => goBackOrReplace('/')}
          >
            <ArrowLeft color={palette.charcoal} size={17} />
          </Tappable>
        ) : (
          <View className="h-9 w-9" />
        )}

        <Tappable
          accessibilityRole="button"
          accessibilityLabel="Exit project"
          className="h-9 w-9 items-center justify-center rounded-full"
          onPress={exit}
        >
          <X color={palette.charcoalSoft} size={17} />
        </Tappable>
      </View>

      <StepProgress current={step} />
    </View>
  );
}
