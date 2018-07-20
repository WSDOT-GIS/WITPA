// tslint:disable:max-classes-per-file

/**
 * Thrown when a string cannot be parsed into a valid Date object.
 */
export class CannotParseDateError extends Error {
  /**
   * Creates a new instance of this error.
   */
  constructor(public readonly dateInput: string) {
    super(`Cannot parse into date: "${dateInput}"`);
  }
}
