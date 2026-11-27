/**
 * POST /api/kyc: registers the signed-in wallet as a KYC member. Runs on the
 * server only; the logic and the registrar key stay in kyc.server.ts.
 */
import type { ActionFunctionArgs } from "@remix-run/cloudflare";

import { getKycConfig, handleKycRequest } from "~/lib/kyc/kyc.server";

export const action = ({ request, context }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  return handleKycRequest(request, getKycConfig(context.cloudflare?.env));
};

export const loader = () =>
  new Response(null, { status: 405, headers: { Allow: "POST" } });
