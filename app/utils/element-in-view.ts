export type VisibleInViewportModifier = {
  heightDifference?: number;
};

export function isVisibleInViewport(
  element: Element,
  modifier?: VisibleInViewportModifier
) {
  const elementStyle = window.getComputedStyle(element);
  const { heightDifference = 0 } = modifier ?? {};
  //Particular cases when the element is not visible at all
  if (
    elementStyle.height == '0px' ||
    elementStyle.display == 'none' ||
    elementStyle.opacity == '0' ||
    elementStyle.visibility == 'hidden' ||
    elementStyle.clipPath == 'circle(0px at 50% 50%)' ||
    elementStyle.transform == 'scale(0)' ||
    element.hasAttribute('hidden')
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();

  //Overlapping strict check
  const baseElementLeft = rect.left;
  const baseElementTop = rect.top;

  const elementFromStartingPoint = document.elementFromPoint(
    baseElementLeft,
    baseElementTop
  );

  if (
    elementFromStartingPoint != null &&
    !element.isSameNode(elementFromStartingPoint)
  ) {
    const elementZIndex = elementStyle.zIndex;
    const elementOverlappingZIndex = window.getComputedStyle(
      elementFromStartingPoint
    ).zIndex;
    if (Number(elementZIndex) < Number(elementOverlappingZIndex)) {
      return false;
    }

    if (elementZIndex === '' && elementOverlappingZIndex === '') {
      /**
              If two positioned elements overlap without a z-index specified, the element 
          positioned last in the HTML code will be shown on top 
              **/
      if (
        element.compareDocumentPosition(elementFromStartingPoint) &
        Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        return false;
      }
    }
  }

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) -
        heightDifference &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
