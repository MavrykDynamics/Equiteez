import { GENERATED_STATIC_SITEMAP_PATHS } from "~/generated/sitemap-routes";
import { fetchAssets } from "~/lib/apis/rwa/assets/assets";

type SitemapEntry = {
  url: string;
  lastmod?: string;
};

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

const toLastmod = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const resolveBaseUrl = (request: Request) =>
  process.env.BASE_URL || new URL(request.url).origin;

const getAssetEntries = async (baseUrl: string): Promise<SitemapEntry[]> => {
  try {
    const { items } = await fetchAssets();

    return items
      .filter((asset) => asset.address.length > 0)
      .map((asset) => ({
        url: toAbsoluteUrl(
          `/trade/${encodeURIComponent(asset.address)}`,
          baseUrl
        ),
        lastmod: toLastmod(asset.updated_at),
      }));
  } catch (error) {
    // Keep serving static pages when the assets API is unavailable
    console.error("Failed to fetch assets for sitemap.xml", error);
    return [];
  }
};

export const getSitemapEntries = async (
  request: Request
): Promise<SitemapEntry[]> => {
  const baseUrl = resolveBaseUrl(request);
  const staticEntries = GENERATED_STATIC_SITEMAP_PATHS.map((pathname) => ({
    url: toAbsoluteUrl(pathname, baseUrl),
  }));
  const assetEntries = await getAssetEntries(baseUrl);

  const entriesByUrl = new Map<string, SitemapEntry>();
  [...staticEntries, ...assetEntries].forEach((entry) => {
    if (!entriesByUrl.has(entry.url)) entriesByUrl.set(entry.url, entry);
  });

  return [...entriesByUrl.values()];
};

export const getRobotsTxt = (request: Request) =>
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /portfolio",
    `Sitemap: ${toAbsoluteUrl("/sitemap.xml", resolveBaseUrl(request))}`,
  ].join("\n");

export const toXmlSitemap = (entries: readonly SitemapEntry[]) => {
  const urlsAsXml = entries
    .map(
      ({ url, lastmod }) =>
        `<url><loc>${escapeXml(url)}</loc>${
          lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
        }</url>`
    )
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
