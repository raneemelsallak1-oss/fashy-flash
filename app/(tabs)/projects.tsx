import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from 'heroui-native';
import { ImagePlus } from 'lucide-react-native';

import { ProjectCard } from '@/components/project/ProjectCard';
import { PrimaryButton } from '@/components/ui/ActionButton';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';

export default function ProjectsScreen() {
  const projects = useAppStore((state) => state.projects);
  const startProject = useAppStore((state) => state.startProject);

  const createProject = () => {
    startProject();
    router.push('/create/upload');
  };

  return (
    <ScrollView
      className="bg-ivory flex-1"
      contentContainerClassName="px-5 pt-safe-offset-4 pb-10 gap-6"
      showsVerticalScrollIndicator={false}
    >
      <ScreenTitle
        eyebrow="Library"
        title="Your projects"
        support="Every garment you have turned into fashion content."
      />

      {projects.length === 0 ? (
        <View className="border-sand bg-surface items-center gap-4 rounded-[24px] border border-dashed px-6 py-12">
          <View className="bg-blush-mist h-12 w-12 items-center justify-center rounded-full">
            <ImagePlus color={palette.blush} size={20} strokeWidth={1.8} />
          </View>
          <View className="gap-1.5">
            <Text className="font-display-medium text-foreground text-center text-[19px]">
              No projects yet
            </Text>
            <Text className="text-muted text-center text-[13px] leading-[19px]">
              Upload a few garment photos and your first set of visuals will land here.
            </Text>
          </View>
          <PrimaryButton label="Create New Project" onPress={createProject} className="mt-1" />
        </View>
      ) : (
        <View className="gap-2.5">
          {projects.map((project) => (
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
      )}

      {projects.length > 0 ? (
        <PrimaryButton label="Create New Project" onPress={createProject} />
      ) : null}
    </ScrollView>
  );
}
