/**
 * Reloads the tab now if it is hidden, otherwise the next time it is hidden,
 * so the user never sees it reload. Returns a function that cancels a reload
 * that has not happened yet.
 */
export function reloadWhenHidden(
  doc: Document = document,
  reload: () => void = () => window.location.reload()
): () => void {
  if (doc.visibilityState === "hidden") {
    reload();
    return () => undefined;
  }

  const handleVisibilityChange = () => {
    if (doc.visibilityState !== "hidden") return;
    doc.removeEventListener("visibilitychange", handleVisibilityChange);
    reload();
  };

  doc.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    doc.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
