/**
 * The intended use for this error class is when an HTML element
 * does not have an attribute that it is expected to have.
 */
export default class MissingAttributeError extends Error {
  /**
   * Creates a new instance of this class
   * @param element The HTML element that is missing an attribute.
   * @param attributeName The name of the attribute that is missing.
   */
  constructor(element: HTMLElement, attributeName: string) {
    const message = `Element ${element.id ||
      ""}missing expected attribute: ${attributeName}`;
    super(message);
  }
}
