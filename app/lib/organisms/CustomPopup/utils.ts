let openPopupCount = 0;

export const onAfterOpen = () => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  if (openPopupCount === 0) {
    document.body.classList.add("overflowYHidden");

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.marginRight =
      scrollBarWidth > 0 ? `${scrollBarWidth}px` : "";
  }

  openPopupCount += 1;
};

export const onAfterClose = () => {
  if (typeof document === "undefined" || openPopupCount === 0) {
    return;
  }

  openPopupCount -= 1;

  if (openPopupCount > 0) {
    return;
  }

  document.body.classList.remove("overflowYHidden");
  document.body.style.marginRight = "";
};
