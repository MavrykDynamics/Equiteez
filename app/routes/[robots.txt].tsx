import type { LoaderFunctionArgs } from "@remix-run/node";
import { getRobotsTxt } from "~/lib/sitemap/sitemap.server";

export const loader = ({ request }: LoaderFunctionArgs) => {
  const robotText = getRobotsTxt(request);

  return new Response(robotText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
