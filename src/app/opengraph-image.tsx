import { site } from '@/data/site';
import { createSocialImage, socialImageSize } from '@/lib/social-image';

export const size = socialImageSize;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return createSocialImage({
    eyebrow: 'Una colección para sentir',
    title: site.tagline,
    subtitle: site.description,
  });
}
