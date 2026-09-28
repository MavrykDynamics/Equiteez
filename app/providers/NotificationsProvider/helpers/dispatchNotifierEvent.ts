import type { NotifierChannelHandler } from "../notifications.provider.types";
import type { NotifierEventFrame } from "../notifications.types";

export function dispatchNotifierEvent(
  handlers: Iterable<NotifierChannelHandler>,
  frame: NotifierEventFrame,
  wallet: string
) {
  const reportError = () => console.warn("Notifier listener failed");
  for (const handler of [...handlers]) {
    try {
      void Promise.resolve(handler(frame, wallet)).catch(reportError);
    } catch {
      reportError();
    }
  }
}
