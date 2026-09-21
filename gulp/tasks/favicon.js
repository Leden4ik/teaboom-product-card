import gulp from "gulp";

import {filePaths} from "../config/paths.js";
import {logger} from "../config/logger.js";

const favicon = () => {
  return gulp.src(filePaths.src.favicon).pipe(logger.handleError("FAVICON")).pipe(gulp.dest(filePaths.build.favicon));
};

export {favicon};
