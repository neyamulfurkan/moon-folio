import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import DOMPurify from 'isomorphic-dompurify';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import { ElectricButton } from '@/components/ui/ElectricButton';
import {
  HairIdle,
  FaceRelaxed,
  Sunglasses,
  Body,
  LeftArm,
  RightArm,
  Legs,
  Stool,
  DeskSetup,
  PCTower,
  WireAndPulse,
  ThoughtBubbleCharacter,
} from '@/components/character/SparkParts';

export const revalidate = 3600;

type PageProps = {
  params: { slug: string };
};

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const project = await prisma.project.findFirst({
      where: { slug: params.slug, published: true },
      select: {
        title: true,
        shortDesc: true,
        thumbnailUrl: true,
        slug: true,
      },
    });

    if (!project) {
      return { title: `Not Found | ${SITE_NAME}` };
    }

    const ogImage = project.thumbnailUrl
      ? project.thumbnailUrl.includes('res.cloudinary.com')
        ? project.thumbnailUrl.replace('/upload/', '/upload/w_1200,h_630,c_fill,f_auto,q_auto/')
        : project.thumbnailUrl
      : undefined;

    return {
      title: `${project.title} | ${SITE_NAME}`,
      description: project.shortDesc,
      alternates: {
        canonical: `${SITE_URL}/projects/${project.slug}`,
      },
      openGraph: {
        title: project.title,
        description: project.shortDesc,
        url: `${SITE_URL}/projects/${project.slug}`,
        ...(ogImage && {
          images: [{ url: ogImage, width: 1200, height: 630, alt: project.title }],
        }),
      },
    };
  } catch {
    return { title: SITE_NAME };
  }
}

const SparkGhost: React.FC = () => (
  <svg
    viewBox="0 0 480 520"
    role="img"
    aria-label="Spark — Moon's portfolio character"
    style={{ width: '100%', height: '100%' }}
  >
    <WireAndPulse showPulse={false} />
    <DeskSetup />
    <Stool />
    <PCTower />
    <Legs />
    <Body />
    <LeftArm />
    <RightArm />
    <FaceRelaxed />
    <Sunglasses />
    <HairIdle />
    <ThoughtBubbleCharacter symbol="{ }" opacity={0.5} />
  </svg>
);

const BackLink: React.FC = () => (
  <a
    href="/#projects"
    className="inline-flex items-center gap-2 text-sm font-mono"
    style={{ color: 'var(--color-text-secondary)' }}
  >
    <span aria-hidden="true">←</span>
    <span>Back to Projects</span>
  </a>
);

export default async function ProjectDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const project = await prisma.project.findFirst({
    where: { slug: params.slug, published: true },
  });

  if (!project) {
    notFound();
  }

  const sanitizedFullDesc = project.fullDesc
    ? DOMPurify.sanitize(project.fullDesc, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'a',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })
    : '';

  const displayedTech = project.techStack.slice(0, 5);
  const extraTechCount = project.techStack.length - displayedTech.length;

  return (
    <main
      id="main"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Ghost Spark background */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '480px',
          maxWidth: '80vw',
          opacity: 0.06,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <SparkGhost />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '96px 32px 96px',
        }}
      >
        {/* Back navigation */}
        <div style={{ marginBottom: '48px' }}>
          <BackLink />
        </div>

        {/* Hero thumbnail */}
        {project.thumbnailUrl && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '480px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '48px',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <Image
              src={
                project.thumbnailUrl.includes('res.cloudinary.com')
                  ? project.thumbnailUrl.replace(
                      '/upload/',
                      '/upload/w_1440,h_960,c_fill,f_auto,q_auto/'
                    )
                  : project.thumbnailUrl
              }
              alt={project.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, var(--color-bg-primary) 0%, transparent 50%)',
              }}
            />
          </div>
        )}

        {/* Header */}
        <header style={{ marginBottom: '40px' }}>
          {/* Category eyebrow */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '12px',
            }}
          >
            {project.category}
            {project.featured && (
              <span
                style={{
                  marginLeft: '12px',
                  color: 'var(--color-accent)',
                }}
              >
                ★ Featured
              </span>
            )}
          </p>

          {/* Title */}
          <h1
            style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}
          >
            {project.title}
          </h1>

          {/* Short description */}
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              maxWidth: '680px',
              marginBottom: '24px',
            }}
          >
            {project.shortDesc}
          </p>

          {/* Tech stack chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
            {displayedTech.map((tech) => (
              <span
                key={tech}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  border: '1px solid var(--color-border-default)',
                }}
              >
                {tech}
              </span>
            ))}
            {extraTechCount > 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                +{extraTechCount} more
              </span>
            )}
          </div>

          {/* CTA links */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {project.liveUrl && (
              <ElectricButton variant="primary" href={project.liveUrl} aria-label={`View live site for ${project.title}`}>
                Live Site ↗
              </ElectricButton>
            )}
            {project.githubUrl && (
              <ElectricButton variant="ghost" href={project.githubUrl} aria-label={`View GitHub repository for ${project.title}`}>
                GitHub ↗
              </ElectricButton>
            )}
          </div>
        </header>

        {/* Divider */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--color-border-default)',
            marginBottom: '48px',
          }}
        />

        {/* Full description */}
        {sanitizedFullDesc && (
          <section style={{ marginBottom: '64px' }}>
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: sanitizedFullDesc }}
              style={{
                fontSize: 'var(--text-base)',
                lineHeight: 1.7,
                color: 'var(--color-text-secondary)',
                maxWidth: '720px',
              }}
            />
          </section>
        )}

        {/* Gallery */}
        {project.galleryUrls && project.galleryUrls.length > 0 && (
          <section style={{ marginBottom: '64px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '24px',
              }}
            >
              Gallery
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {project.galleryUrls.map((url, i) => (
                <div
                  key={url}
                  style={{
                    position: 'relative',
                    height: '200px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  <Image
                    src={
                      url.includes('res.cloudinary.com')
                        ? url.replace('/upload/', '/upload/w_600,h_400,c_fill,f_auto,q_auto/')
                        : url
                    }
                    alt={`${project.title} gallery image ${i + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Challenge / Solution */}
        {(project.challenge ?? project.solution) && (
          <section style={{ marginBottom: '64px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '32px',
              }}
            >
              {project.challenge && (
                <div
                  style={{
                    padding: '32px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  <h2
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 600,
                      marginBottom: '16px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ color: 'var(--color-accent)' }}>&lt;</span>
                    Challenge
                    <span style={{ color: 'var(--color-accent)' }}>&gt;</span>
                  </h2>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.7,
                    }}
                  >
                    {project.challenge}
                  </p>
                </div>
              )}
              {project.solution && (
                <div
                  style={{
                    padding: '32px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  <h2
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 600,
                      marginBottom: '16px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ color: 'var(--color-accent)' }}>&lt;</span>
                    Solution
                    <span style={{ color: 'var(--color-accent)' }}>&gt;</span>
                  </h2>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.7,
                    }}
                  >
                    {project.solution}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            borderTop: '1px solid var(--color-border-default)',
            paddingTop: '48px',
          }}
        >
          <BackLink />
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {project.liveUrl && (
              <ElectricButton variant="primary" href={project.liveUrl} aria-label={`View live site for ${project.title}`}>
                View Live Site ↗
              </ElectricButton>
            )}
            {project.githubUrl && (
              <ElectricButton variant="ghost" href={project.githubUrl} aria-label={`View source on GitHub`}>
                View on GitHub ↗
              </ElectricButton>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .prose-content p { margin-bottom: 1em; }
        .prose-content ul, .prose-content ol { padding-left: 1.5em; margin-bottom: 1em; }
        .prose-content li { margin-bottom: 0.4em; }
        .prose-content h1, .prose-content h2, .prose-content h3 {
          color: var(--color-text-primary);
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .prose-content code {
          font-family: var(--font-mono);
          font-size: 0.9em;
          background: var(--color-bg-tertiary);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .prose-content pre {
          background: var(--color-bg-tertiary);
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 1em;
        }
        .prose-content pre code {
          background: none;
          padding: 0;
        }
        .prose-content a {
          color: var(--color-accent);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .prose-content blockquote {
          border-left: 3px solid var(--color-accent);
          padding-left: 1em;
          margin-left: 0;
          color: var(--color-text-secondary);
        }
      `}</style>
    </main>
  );
}