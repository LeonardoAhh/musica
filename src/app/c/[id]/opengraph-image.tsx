import { site } from '@/data/site';
import { songs } from '@/data/songs';
import { createSocialImage, socialImageSize } from '@/lib/social-image';

export const size = socialImageSize;
export const contentType = 'image/png';

export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const song = songs.find((item) => item.id === id);

  return createSocialImage({
    eyebrow: song ? `${song.genre} / ${song.mood}` : 'Archivo sonoro',
    title: song?.title ?? site.tagline,
    subtitle: song?.artist ?? site.description,
  });
}
