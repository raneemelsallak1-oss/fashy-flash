import { View } from 'react-native';
import { Text } from 'heroui-native';
import { ChevronRight } from 'lucide-react-native';

import { AssetImage } from '@/components/ui/AssetImage';
import { Tappable } from '@/components/ui/Tappable';
import { isFinalAsset } from '@/lib/generation';
import { palette } from '@/lib/theme';
import type { Project } from '@/lib/types';

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

type ProjectCardProps = {
  project: Project;
  onPress: () => void;
};

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const finalAssets = project.assets.filter(isFinalAsset);
  const cover = finalAssets[0];
  const approved = finalAssets.filter((asset) => asset.isApproved).length;

  return (
    <Tappable
      accessibilityRole="button"
      accessibilityLabel={`Open ${project.name}`}
      onPress={onPress}
      scaleTo={0.99}
      className="border-border bg-surface flex-row items-center gap-3.5 rounded-[20px] border p-3"
    >
      {cover ? (
        <AssetImage asset={cover} width={58} aspect={3 / 4} rounded="rounded-[14px]" />
      ) : null}

      <View className="flex-1 gap-1">
        <Text className="font-display-medium text-foreground text-[17px] leading-[21px]">
          {project.name}
        </Text>
        <Text className="text-muted text-[12px]">
          {finalAssets.length} visuals · {approved} approved · {formatDate(project.createdAt)}
        </Text>
      </View>

      <ChevronRight color={palette.muted} size={18} />
    </Tappable>
  );
}
