// A synchronous transition clock preserves away-and-back changes even when
// React batches the resulting renders. It stores no credentials or payloads.
let revision = 0;
const identities = new Map<string, string>();
const listeners = new Set<() => void>();
export function updateRelayScopeIdentity(source: string, identity: string) {
  if (identities.get(source) === identity) return;
  identities.set(source, identity);
  revision += 1;
  listeners.forEach((listener) => listener());
}
export const getRelayScopeRevision = () => revision;
export const subscribeRelayScope = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
