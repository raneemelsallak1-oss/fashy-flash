import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text } from 'heroui-native';
import { ArrowRight, Clock3, Sparkles, TrendingDown } from 'lucide-react-native';

import { Logo } from '@/components/brand/Logo';
import { ProjectCard } from '@/components/project/ProjectCard';
import { PrimaryButton } from '@/components/ui/ActionButton';
import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { imageForKind } from '@/lib/gallery';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';

const BENEFITS = [
  { icon: Clock3, label: 'Save time' },
  { icon: TrendingDown, label: 'Reduce production costs' },
  { icon: Sparkles, label: 'Create professional content' },
];

export default function HomeScreen() {
  const projects = useAppStore((state) => state.projects);
  const startProject = useAppStore((state) => state.startProject);

  const recent = projects.slice(0, 3);

  const createProject = () => {
    startProject();
    router.push('/create/upload');
  };

  return (
    <ScrollView
      className="bg-ivory flex-1"
      contentContainerClassName="px-5 pt-safe-offset-3 pb-10 gap-7"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center justify-between">
        <Logo size="md" />
        <Text className="text-muted text-[10px] tracking-[1.8px] uppercase">AI Fashion Studio</Text>
      </View>

      <View className="gap-4">
        <Text className="font-display-medium text-foreground text-[34px] leading-[41px]">
          From garment photos to ready-to-use fashion content in minutes.
        </Text>
        <Text className="text-charcoal-soft text-[15px] leading-[23px]">
          Upload 2–3 garment photos and create professional e-commerce, social media and catalog
          visuals with AI.
        </Text>
      </View>

      <View className="border-border bg-surface overflow-hidden rounded-[28px] border">
        <View className="relative" style={{ aspectRatio: 4 / 5 }}>
          <Image
            source={imageForKind('studio')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(35,33,32,0.55)']}
            className="absolute right-0 bottom-0 left-0 h-2/5"
          />
          <View className="absolute right-4 bottom-4 left-4 flex-row items-center justify-between">
            <View className="bg-ivory/95 rounded-full px-3 py-1.5">
              <Text className="text-charcoal text-[11px] tracking-[1.2px] uppercase">
                Studio look
              </Text>
            </View>
            <Text className="text-ivory/90 text-[11px]">3 photos · 8 visuals</Text>
          </View>
        </View>
      </View>

      <View className="gap-3">
        <PrimaryButton
          label="Create New Project"
          onPress={createProject}
          icon={<ArrowRight color={palette.ivory} size={17} />}
        />

        <View className="flex-row gap-2.5">
          {BENEFITS.map((benefit) => (
            <View
              key={benefit.label}
              className="border-border bg-surface flex-1 gap-2 rounded-[18px] border px-3 py-3.5"
            >
              <benefit.icon color={palette.blush} size={16} strokeWidth={1.8} />
              <Text className="text-charcoal-soft text-[12px] leading-[16px]">{benefit.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {recent.length > 0 ? (
        <View className="gap-3">
          <View className="flex-row items-end justify-between">
            <Text className="font-display-medium text-foreground text-[20px]">Recent Projects</Text>
            {projects.length > recent.length ? (
              <Text className="text-muted text-[12px]" onPress={() => router.push('/projects')}>
                See all
              </Text>
            ) : null}
          </View>

          <View className="gap-2.5">
            {recent.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() =>
                  router.push({
                    pathname: '/project/[projectId]',
                    params: { projectId: project.id },
                  })
                }
              />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
