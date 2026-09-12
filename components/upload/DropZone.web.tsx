import { useState } from 'react';

import { DropZoneSurface } from '@/components/upload/DropZoneSurface';
import type { DropZoneProps } from '@/components/upload/DropZone.types';
import type { PickedPhoto } from '@/lib/picker';

function readImage(file: File): Promise<PickedPhoto> {
  const uri = URL.createObjectURL(file);

  return new Promise((resolve) => {
    const probe = new window.Image();
    probe.addEventListener('load', () =>
      resolve({ uri, width: probe.naturalWidth, height: probe.naturalHeight }),
    );
    probe.addEventListener('error', () => resolve({ uri, width: 1000, height: 1250 }));
    probe.src = uri;
  });
}

/** Web: real drag-and-drop on top of the shared drop zone visual. */
export function DropZone({ onBrowse, onDropFiles, isDisabled }: DropZoneProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      onDragOver={(event) => {
        if (isDisabled) return;
        event.preventDefault();
        setIsActive(true);
      }}
      onDragLeave={() => setIsActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsActive(false);
        if (isDisabled || !onDropFiles) return;

        const files = Array.from(event.dataTransfer.files).filter((file) =>
          file.type.startsWith('image/'),
        );
        if (files.length === 0) return;

        void Promise.all(files.map(readImage)).then(onDropFiles);
      }}
    >
      <DropZoneSurface isActive={isActive} onBrowse={onBrowse} isDisabled={isDisabled} />
    </div>
  );
}
