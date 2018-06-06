import { readdir, readFileSync, writeFile } from "fs";
import { minify } from "html-minifier";
import { basename, resolve } from "path";

const templatesDir = resolve(__dirname, "..", "src", "browser", "Templates");

readdir(templatesDir, (err, files) => {
  if (err) {
    throw err;
  } else if (files.length === 0) {
    console.warn(`No files were found in ${templatesDir}`);
  }
  const outObj: { [key: string]: string } = {};
  for (const file of files) {
    const filename = resolve(templatesDir, file);
    console.log(`Processing ${filename}...`);
    const data = readFileSync(filename);
    const content = minify(data.toString(), {
      collapseWhitespace: true
    });
    const key = basename(file, ".html");
    outObj[key] = content;
  }

  for (const key in outObj) {
    if (outObj.hasOwnProperty(key)) {
      const value = outObj[key];
    }
  }

  const outDir = resolve(templatesDir, "..");
  const outFile = resolve(outDir, "templates.ts");
  const outText = `export default ${JSON.stringify(outObj)}`;
  writeFile(outFile, outText, writeErr => {
    if (writeErr) {
      console.error(writeErr);
    }
  });
});
