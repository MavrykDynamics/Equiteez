import { BASE_URL, navbar, toXmlSitemap } from '~/consts/sitemap';
import { estateSlugs } from '~/providers/EstatesProvider/estates.provider';

export const loader = async () => {
  try {
    const estates = estateSlugs;

    const sitemap = toXmlSitemap([
      ...navbar
        .filter(({ to }) => to !== '/')
        .map(({ to }) => `${BASE_URL}${to}`),
      ...estates.map((slug) => `${BASE_URL}/exchange/${slug}`),
      ...estates.map((slug) => `${BASE_URL}/properties/${slug}`),
    ]);

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    throw new Response('Internal Server Error', { status: 500 });
  }
};
