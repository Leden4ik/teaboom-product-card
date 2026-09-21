import gulp from "gulp";
import {deleteAsync} from "del";
import zipPlugin from "gulp-zip";

import {filePaths} from "../config/paths.js";
import {logger} from "../config/logger.js";
import {project} from "../config/project.js";

// Имя архива: из project.name, иначе — имя папки проекта.
const archiveName = (project.name || filePaths.projectDirName).replace(/\s+/g, "-");

const zip = async () => {
  await deleteAsync(`./${archiveName}.zip`);
  logger.warning("Прошлый ZIP архив успешно удалён");

  return gulp
    .src(`${filePaths.buildFolder}/**/*.*`, {})
    .pipe(logger.handleError("ZIP"))
    .pipe(zipPlugin(`${archiveName}.zip`))
    .pipe(gulp.dest("./"));
};

export {zip};
