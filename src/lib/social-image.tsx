import { ImageResponse } from 'next/og';

import { site } from '@/data/site';

export const socialImageSize = { width: 1200, height: 630 } as const;

type SocialImageContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function createSocialImage({ eyebrow, title, subtitle }: SocialImageContent) {
  const titleSize = title.length > 90 ? 50 : title.length > 60 ? 62 : title.length > 34 ? 76 : 94;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '58px 70px',
        background: site.colors.canvas,
        color: site.colors.ink,
        border: `1px solid ${site.colors.ink}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, fontWeight: 600 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            border: `2px solid ${site.colors.ink}`,
            borderRadius: 17,
            fontSize: 20,
          }}
        >
          ·
        </div>
        {site.name.toLowerCase()}.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1040 }}>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase' }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: titleSize, fontFamily: 'Georgia, serif', lineHeight: 0.95 }}>
          {title}
        </div>
        <div style={{ fontSize: 25, lineHeight: 1.35 }}>{subtitle}</div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: 18,
          borderTop: `1px solid ${site.colors.ink}`,
          fontSize: 17,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        <span>Archivo sonoro</span>
        <span>{site.shortName}</span>
      </div>
    </div>,
    socialImageSize
  );
}
