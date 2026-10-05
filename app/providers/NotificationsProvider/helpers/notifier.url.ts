import { NOTIFIER_WS_PATH } from "~/providers/NotificationsProvider/notifications.const";

export const resolveNotifierUrl = (
  rwaApiUrl = process.env.RWA_API
): string | null => {
  if (!rwaApiUrl?.trim()) {
    return null;
  }

  try {
    const url = new URL(rwaApiUrl);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = NOTIFIER_WS_PATH;
    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
};

