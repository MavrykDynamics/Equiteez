export const onAfterOpen = () => {
  document.body.classList.add('overflowYHidden');
  // to avois layout shifting when opening a popup
  const currentWidth = document.body.offsetWidth;
  const scrollBarWidth = document.body.offsetWidth - currentWidth;
  document.body.style.marginRight = `${scrollBarWidth}px`;
};

export const onAfterClose = () => {
  document.body.classList.remove('overflowYHidden');
  // remove margin to show scrollbar
  document.body.style.marginRight = '';
};
