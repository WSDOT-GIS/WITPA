/**
 * Copies CSS files from the node_modules directory to the css directory.
 */
import { constants, copyFile } from "fs";
import { resolve } from "path";

const [source, dest] = [
  "../node_modules/dialog-polyfill/dialog-polyfill.css",
  "../css/"
].map(relpath => {
  return resolve(__dirname, relpath);
});

const outCssFile = resolve(dest, "dialog-polyfill.css");

// Copy the file, overwriting if it already exists.
copyFile(source, outCssFile, constants.COPYFILE_FICLONE, err => {
  if (err) {
    console.error("Copy file error", err);
  }
});
