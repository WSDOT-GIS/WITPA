declare module "dijit/*" {
    const o: any;
    export = o;
}

declare module "dialog-polyfill" {
    function registerDialog(element: HTMLDialogElement): void;
}