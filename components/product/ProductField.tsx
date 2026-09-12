import { ScrollView, View } from 'react-native';
import { Description, Input, Label, TextArea, TextField } from 'heroui-native';

import { Tappable } from '@/components/ui/Tappable';
import { cn } from '@/lib/utils';

type ProductFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  optional?: boolean;
  multiline?: boolean;
  /** Short helper line under the field. */
  hint?: string;
  suggestions?: readonly string[];
};

/** Labelled product field with optional tap-to-fill suggestions. */
export function ProductField({
  label,
  value,
  onChangeText,
  placeholder,
  optional,
  multiline,
  hint,
  suggestions,
}: ProductFieldProps) {
  return (
    <View className="gap-2">
      <TextField>
        <Label className="text-charcoal-soft text-[12px] tracking-[1.4px] uppercase">
          {label}
          {optional ? ' — optional' : ''}
        </Label>
        {multiline ? (
          <TextArea
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            className="border-border bg-surface min-h-24 rounded-[16px] border text-[14px]"
          />
        ) : (
          <Input
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            className="border-border bg-surface rounded-[16px] border text-[14px]"
          />
        )}
        {hint ? <Description className="text-muted text-[12px]">{hint}</Description> : null}
      </TextField>

      {suggestions && suggestions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 pr-2"
        >
          {suggestions.map((suggestion) => {
            const selected = value === suggestion;
            return (
              <Tappable
                key={suggestion}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChangeText(suggestion)}
                scaleTo={0.94}
                className={cn(
                  'rounded-full border px-3 py-1.5',
                  selected ? 'border-blush bg-blush-mist' : 'border-border bg-surface',
                )}
              >
                <Label
                  className={cn('text-[12px]', selected ? 'text-foreground' : 'text-charcoal-soft')}
                >
                  {suggestion}
                </Label>
              </Tappable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}
