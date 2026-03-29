'use client';

import { useState, useCallback } from 'react';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ProjectDetailOverlay } from '@/components/sections/ProjectsSection';
import type { ProjectSummary, Project } from '@/types/index';

type Props = {
  projects: ProjectSummary[];
};

export const ProjectsSectionWrapper: React.FC<Props> = ({ projects }) => {
  const [overlayProject, setOverlayProject] = useState<Project | null>(null);

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