import { BASE_URL } from '~/consts/sitemap';

export const loader = () => {
  const robotText = `
          User-agent: Googlebot
          Disallow: /nogooglebot/
          User-agent: *
          Allow: /
          Sitemap: ${BASE_URL}/sitemap.xml`;

  return new Response(robotText, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
