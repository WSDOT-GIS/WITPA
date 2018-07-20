// tslint:disable:max-classes-per-file

/**
 * The intended use for this error class is when an HTML element
 * does not have an attribute that it is expected to have.
 */
export class MissingAttributeError extends Error {
  public readonly element: HTMLElement;
  public readonly attributeName: string;
  /**
   * Creates a new instance of this class
   * @param element The HTML element that is missing an attribute.
   * @param attributeName The name of the attribute that is missing.
   */
  constructor(element: HTMLElement, attributeName: string) {
    const message = `Element ${element.id ||
      ""}missing expected attribute: ${attributeName}`;
    super(message);
    this.element = element;
    this.attributeName = attributeName;
  }
}

/**
 * This error is throw when a function is expecting the type attributes
 * of two input elements to have the same value, but they do not.
 */
export class TypeAttributeMismatchError extends TypeError {
  /**
   * Creates a new instance of this error class.
   * @param beginInputElement An input element
   * @param endInputElement A different input element
   */
  constructor(
    public readonly beginInputElement: HTMLInputElement,
    public readonly endInputElement: HTMLInputElement
  ) {
    super(
      `"type" attributes do not match: #${beginInputElement.id}:${
        beginInputElement.type
      }, #${endInputElement.id}:${endInputElement.type}`
    );
  }
}

/**
 * This error is thrown when an input element is exected to have a matching
 * input element (both representing a range) but the matching element cannot
 * be found.
 */
export class MatchingElementForRangeInputNotFound extends Error {
  /**
   * Creates a new instance of this error.
   * @param inputElement - The input element for which a match cannot be found.
   */
  constructor(public readonly inputElement: HTMLInputElement) {
    super(
      "begin range input element does not have matching end input element."
    );
  }
}
