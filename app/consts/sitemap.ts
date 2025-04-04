export const { BASE_URL } = process.env;

export const navbar = [
  { to: "/", text: "Home" },
  { to: "/properties", text: "Estates Page" },
  { to: "/marletplace", text: "Marketplace Page" },
  { to: "/exchange", text: "Exchange Page" },
];

export const toXmlSitemap = (urls: string[]) => {
  const urlsAsXml = urls
    .map((url) => `<url><loc>${url}</loc></url>`)
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
