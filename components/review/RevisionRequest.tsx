import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Label, Spinner, Text, TextArea, TextField } from 'heroui-native';
import { RefreshCw, Sparkles, X } from 'lucide-react-native';

import { SecondaryButton } from '@/components/ui/ActionButton';
import { SectionLabel } from '@/components/ui/ScreenTitle';
import { Tappable } from '@/components/ui/Tappable';
import type { RevisionStatus } from '@/lib/store';
import { palette } from '@/lib/theme';
import type { AppliedRevision } from '@/lib/types';

type RevisionRequestProps = {
  status: RevisionStatus;
  error: string | null;
  /** The revision the visible outputs were rebuilt from, if any. */
  applied: AppliedRevision | null;
  onSubmit: (request: string) => void;
  onDismiss: () => void;
};

const PLACEHOLDER = 'e.g. Make it burgundy silk and shoot it outdoors on a male model';

/** Shows at most this many changed properties before summarising the rest. */
const CHANGE_LIMIT = 5;

/** Shows at most this many preserved field names in the kept-as-is line. */
const PRESERVED_LIMIT = 4;

function preservedLine(preserved: string[]): string | null {
  if (preserved.length === 0) return null;

  const shown = preserved.slice(0, PRESERVED_LIMIT).join(', ');
  const rest = preserved.length - PRESERVED_LIMIT;
  return rest > 0 ? `Kept as-is: ${shown} and ${rest} more` : `Kept as-is: ${shown}`;
}

/**
 * Free-text revision request. The text and the current product settings go to
 * the backend, the AI service decides which properties it names, and the review
 * grid above rebuilds from the merged result.
 */
export function RevisionRequest({
  status,
  error,
  applied,
  onSubmit,
  onDismiss,
}: RevisionRequestProps) {
  const [text, setText] = useState('');
  const working = status === 'working';
  const appliedId = applied?.id ?? null;
  const clearedFor = useRef<string | null>(null);

  // Clear the field once a request has actually been applied, so a failed one
  // keeps the wording for another try.
  useEffect(() => {
    if (appliedId && clearedFor.current !== appliedId) {
      clearedFor.current = appliedId;
      setText('');
    }
  }, [appliedId]);

  const submit = () => {
    const request = text.trim();
    if (request.length === 0 || working) return;
    onSubmit(request);
  };

  const kept = applied ? preservedLine(applied.preserved) : null;
  const changes = applied?.changes.slice(0, CHANGE_LIMIT) ?? [];
  const extraChanges = (applied?.changes.length ?? 0) - changes.length;

  return (
    <View className="gap-3">
      <SectionLabel label="Refine with AI" hint={working ? 'Working' : 'Optional'} />

      <View className="border-border bg-surface gap-4 rounded-[20px] border p-4">
        <TextField>
          <Label className="text-charcoal-soft text-[12px] tracking-[1.4px] uppercase">
            What would you like to change?
          </Label>
          <TextArea
            value={text}
            onChangeText={setText}
            placeholder={PLACEHOLDER}
            editable={!working}
            maxLength={1200}
            className="border-border bg-ivory min-h-20 rounded-[16px] border text-[14px]"
          />
        </TextField>

        <Text className="text-muted text-[12px] leading-[18px]">
          Your garment photos and every earlier selection are sent along. Anything you do not
          mention stays exactly as it is.
        </Text>

        {working ? (
          <View className="border-border bg-ivory flex-row items-center gap-3 rounded-[16px] border px-4 py-3">
            <Spinner color={palette.blush} />
            <Text className="text-charcoal-soft flex-1 text-[13px] leading-[19px]">
              Reading your request and rebuilding this set…
            </Text>
          </View>
        ) : null}

        <SecondaryButton
          label={working ? 'Regenerating…' : 'Regenerate'}
          onPress={submit}
          isDisabled={working || text.trim().length === 0}
          icon={<RefreshCw color={palette.charcoal} size={16} />}
        />

        {error ? (
          <View className="border-blush bg-blush-mist rounded-[16px] border px-4 py-3">
            <Text className="text-foreground text-[13px] leading-[19px]">{error}</Text>
          </View>
        ) : null}

        {applied && !working ? (
          <View className="border-border bg-blush-tint gap-3 rounded-[16px] border p-4">
            <View className="flex-row items-start gap-2">
              <Sparkles color={palette.blush} size={15} />
              <Text className="text-foreground flex-1 text-[13px] leading-[19px]">
                {applied.summary}
              </Text>
              <Tappable
                accessibilityRole="button"
                accessibilityLabel="Dismiss revision summary"
                onPress={onDismiss}
                scaleTo={0.9}
                className="p-0.5"
              >
                <X color={palette.charcoalSoft} size={15} />
              </Tappable>
            </View>

            {changes.length > 0 ? (
              <View className="gap-1.5">
                {changes.map((change) => (
                  <View key={change.field} className="flex-row items-baseline gap-2">
                    <Text className="text-charcoal-soft w-[104px] text-[11px] tracking-[0.8px] uppercase">
                      {change.label}
                    </Text>
                    <Text className="text-foreground flex-1 text-[12px] leading-[18px]">
                      {change.from} → {change.to}
                    </Text>
                  </View>
                ))}
                {extraChanges > 0 ? (
                  <Text className="text-muted text-[12px]">and {extraChanges} more</Text>
                ) : null}
              </View>
            ) : null}

            {kept ? <Text className="text-muted text-[12px] leading-[18px]">{kept}</Text> : null}

            {applied.unsupported.length > 0 ? (
              <View className="gap-1">
                {applied.unsupported.map((note) => (
                  <Text key={note} className="text-charcoal-soft text-[12px] leading-[18px]">
                    • {note}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
