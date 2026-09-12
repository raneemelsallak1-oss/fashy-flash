import type { PickedPhoto } from '@/lib/picker';

export type DropZoneProps = {
  /** Opens the platform file/library picker. */
  onBrowse: () => void;
  /** Web only: files dropped directly onto the zone. */
  onDropFiles?: (photos: PickedPhoto[]) => void;
  isDisabled?: boolean;
  /** Copy overrides, so the same plate can be reused outside the upload step. */
  title?: string;
  hint?: string;
  actionLabel?: string;
};
