import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { songs, spotifySearch } from '@/data/songs';
import { site } from '@/data/site';
import { artistSlug } from '@/data/paths';
import StarRating from '@/components/star-rating';
import RemoteSongPage from '@/components/remote-song-page';
import SongSleeve from '@/components/song-sleeve';
import DetailBreadcrumb from '@/components/detail-breadcrumb';

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return songs.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const song = songs.find((s) => s.id === id);

  if (!song) return {};

  return {
    title: `${song.title} — ${song.artist} | ${site.name}`,
    description: song.note,
    alternates: { canonical: `/c/${id}` },
    openGraph: {
      url: `/c/${id}`,
      siteName: site.name,
      locale: 'es_MX',
      title: `${song.title} — ${song.artist}`,
      description: song.note,
      type: 'music.song',
      images: [{ url: `/c/${id}/opengraph-image`, width: 1200, height: 630, alt: `${song.title} de ${song.artist}` }],
    },
    twitter: { card: 'summary_large_image', images: [`/c/${id}/opengraph-image`] },
  };
}

export default async function SongPage({ params }: Props) {
  const { id } = await params;
  const song = songs.find((s) => s.id === id);

  if (!song) return <RemoteSongPage id={id} />;

  const related = songs
    .filter((s) => s.id !== song.id && (s.artist === song.artist || s.mood === song.mood))
    .slice(0, 3);

  return (
    <main id="inicio" tabIndex={-1} className="shell detail-page">
      <DetailBreadcrumb title={song.title} />

      <div className="detail-layout">
        <SongSleeve song={song} />

        <article>
          <p className="eyebrow">
            {song.genre} / {song.mood} · {song.score ?? '—'}/10
          </p>

          <h1>{song.title}</h1>
          <p className="detail-lead">{song.note}</p>

          <StarRating songId={song.id} />

          <p>
            <Link className="artist-link" href={`/a/${artistSlug(song.artist)}`}>
              <span>{song.artist}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </p>

          <div className="detail-actions">
            <a
              className="ink-button"
              href={spotifySearch(song)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buscar en Spotify <ArrowUpRight size={17} aria-hidden="true" />
            </a>

            <Link className="outline-button" href="/">
              Volver a la colección
            </Link>
          </div>
        </article>
      </div>

      {related.length > 0 && (
        <section className="catalog">
          <p className="eyebrow">OTRAS JOYAS</p>

          <h2
            style={{
              fontFamily: 'var(--font-editorial),serif',
              fontWeight: 300,
              fontSize: 'clamp(40px,6vw,68px)',
            }}
          >
            Sigue escuchando.
          </h2>

          <div className="related-grid">
            {related.map((s) => (
              <Link className="related-link" key={s.id} href={`/c/${s.id}`}>
                <b>{s.title}</b>
                <span>{s.artist}</span>
                <span className="related-meta">
                  {s.mood} · {s.score ?? '—'}/10{' '}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
