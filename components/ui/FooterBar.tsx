import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

type FooterBarProps = {
  children: ReactNode;
  className?: string;
};

/** Sticky bottom action bar with safe-area padding for primary CTAs. */
export function FooterBar({ children, className }: FooterBarProps) {
  return (
    <View
      className={cn(
        'border-border/70 bg-ivory pb-safe-offset-3 gap-2 border-t px-5 pt-3',
        className,
      )}
    >
      {children}
    </View>
  );
}
