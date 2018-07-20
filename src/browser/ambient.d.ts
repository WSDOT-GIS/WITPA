declare module "dijit/*" {
  const o: any;
  export = o;
}

declare module "dialog-polyfill" {
  function registerDialog(element: HTMLDialogElement): void;
}

/**
 * Google analytics.
 * @param args Arguments
 */
declare function ga(...args: (string | null)[]): any;
