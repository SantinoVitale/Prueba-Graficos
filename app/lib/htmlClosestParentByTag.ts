export const htmlClosestParentByTag = (
  currentElement: HTMLElement,
  tag: string,
): HTMLElement | null => {
  while (currentElement.nodeName !== "#document") {
    currentElement = currentElement.parentNode as HTMLElement
    if (currentElement.nodeName.toLowerCase() === tag) {
      return currentElement
    }
  }
  return null
}
