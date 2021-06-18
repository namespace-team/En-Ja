// import fs from "fs";
// import path from "path";
const fs = require("fs");
const path = require("path");

const listFileNames = (relativeName) => {
  try {
    const folderPath = path.join(process.cwd(), ...relativeName.split("/"));
    const files = fs
      .readdirSync(folderPath, { withFileTypes: true })
      .map((dirent) =>
        dirent.isDirectory()
          ? listFileNames(`${relativeName}/${dirent.name}`)
          : `${folderPath}/${dirent.name}`
      );
    return files.reduce(
      (all, folderContents) => all.concat(folderContents),
      []
    );
  } catch (err) {
    process.exit(1);
  }
};

const invalidFiles = [];
listFileNames("locales").forEach((file) => {
  try {
    JSON.parse(fs.readFileSync(file));
  } catch (e) {
    invalidFiles.push(file);
  }
});

if (invalidFiles.length > 0) {
  console.log("Invalid json Files \n", invalidFiles);
  process.exit(1);
} else {
  process.exit(0);
}
