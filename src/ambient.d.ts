declare module "dojo/text!*" {
    const s: string;
    export = s;
}

declare module "dijit/*" {
    const o: any;
    export = o;
}

declare module "dialog-polyfill" {
    function registerDialog(element: HTMLDialogElement): void;
}