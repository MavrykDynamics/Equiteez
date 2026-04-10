import { GENERATED_STATIC_SITEMAP_PATHS } from "~/generated/sitemap-routes";
import { estateSlugs } from "~/providers/MarketsProvider/estateSlugs";

const XML_ESCAPE_MAP: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (character) => XML_ESCAPE_MAP[character]);

const toAbsoluteUrl = (pathname: string, baseUrl: string) =>
  new URL(pathname, baseUrl).toString();

export const resolveBaseUrl = (request: Request) =>
  process.env.BASE_URL || new URL(request.url).origin;

export const getSitemapUrls = (request: Request) => {
  const baseUrl = resolveBaseUrl(request);
  const dynamicPathnames = estateSlugs.flatMap((slug) => [
    `/exchange/${slug}`,
    `/marketplace/${slug}`,
  ]);

  return [
    ...new Set(
      [...GENERATED_STATIC_SITEMAP_PATHS, ...dynamicPathnames].map((pathname) =>
        toAbsoluteUrl(pathname, baseUrl)
      )
    ),
  ];
};

export const getRobotsTxt = (request: Request) =>
  [
    "User-agent: Googlebot",
    "Disallow: /nogooglebot/",
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${toAbsoluteUrl("/sitemap.xml", resolveBaseUrl(request))}`,
  ].join("\n");

export const toXmlSitemap = (urls: readonly string[]) => {
  const urlsAsXml = urls
    .map((url) => `<url><loc>${escapeXml(url)}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>
${urlsAsXml}
</urlset>`;
};
