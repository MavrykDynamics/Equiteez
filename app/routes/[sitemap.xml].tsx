import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSitemapUrls, toXmlSitemap } from "~/lib/sitemap/sitemap.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const sitemap = toXmlSitemap(getSitemapUrls(request));

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Failed to generate sitemap.xml", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
};
