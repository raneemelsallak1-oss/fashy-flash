import { DropZoneSurface } from '@/components/upload/DropZoneSurface';
import type { DropZoneProps } from '@/components/upload/DropZone.types';

/** Native: the whole plate opens the photo library, there is nothing to drag. */
export function DropZone({ onBrowse, isDisabled, title, hint, actionLabel }: DropZoneProps) {
  return (
    <DropZoneSurface
      onBrowse={onBrowse}
      isDisabled={isDisabled}
      title={title}
      hint={hint}
      actionLabel={actionLabel}
    />
  );
}
