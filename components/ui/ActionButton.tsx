import type { ReactNode } from 'react';
import { Button } from 'heroui-native';

import { cn } from '@/lib/utils';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  isDisabled?: boolean;
  className?: string;
};

/** Charcoal pill: the single primary action on a screen. */
export function PrimaryButton({ label, onPress, icon, isDisabled, className }: ActionButtonProps) {
  return (
    <Button
      size="lg"
      onPress={onPress}
      isDisabled={isDisabled}
      className={cn('bg-charcoal rounded-full', className)}
    >
      <Button.Label className="text-ivory text-[15px] tracking-[0.2px]">{label}</Button.Label>
      {icon}
    </Button>
  );
}

/** Quiet outlined pill for secondary paths. */
export function SecondaryButton({
  label,
  onPress,
  icon,
  isDisabled,
  className,
}: ActionButtonProps) {
  return (
    <Button
      size="lg"
      variant="tertiary"
      onPress={onPress}
      isDisabled={isDisabled}
      className={cn('border-border bg-surface rounded-full border', className)}
    >
      <Button.Label className="text-foreground text-[15px]">{label}</Button.Label>
      {icon}
    </Button>
  );
}
