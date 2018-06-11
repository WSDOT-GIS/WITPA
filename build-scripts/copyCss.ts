import fs from "fs";
import { resolve } from "path";

// tslint:disable:no-console

const [source, dest] = [
  "../node_modules/dialog-polyfill/dialog-polyfill.css",
  "../css/"
].map(relpath => {
  return resolve(__dirname, relpath);
});

const outCssFile = resolve(dest, "dialog-polyfill.css");

fs.copyFile(source, outCssFile, (fs.constants as any).COPYFILE_FICLONE, err => {
  if (err) {
    console.error("Copy file error", err);
  }
});
