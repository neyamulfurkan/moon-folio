'use client';

import { useState, useCallback, useEffect } from 'react';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ProjectDetailOverlay } from '@/components/sections/ProjectsSection';
import type { ProjectSummary, Project } from '@/types/index';

type Props = {
  projects: ProjectSummary[];
};

export const ProjectsSectionWrapper: React.FC<Props> = ({ projects }) => {
  const [overlayProject, setOverlayProject] = useState<Project | null>(null);

  // Hide FloatingSparkIsland when overlay is open
  useEffect(() => {
    const island = document.querySelector('[data-floating-spark]') as HTMLElement | null;
    if (!island) return;
    island.style.display = overlayProject ? 'none' : '';
    return () => {
      if (island) island.style.display = '';
    };
  }, [overlayProject]);

  const handleOverlayOpen = useCallback((project: Project): void => {
    setOverlayProject(project);
  }, []);

  const handleOverlayClose = useCallback((): void => {
    setOverlayProject(null);
  }, []);

  return (
    <>
      <ProjectsSection
        projects={projects}
        onOverlayOpen={handleOverlayOpen}
        externalOverlayProject={overlayProject}
      />
      {/* Rendered at this level — outside SectionTransition overflow:clip */}
      <ProjectDetailOverlay
        project={overlayProject}
        onClose={handleOverlayClose}
      />
    </>
  );
};