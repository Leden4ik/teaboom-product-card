import gulp from "gulp";
import gulpSvgo from "@lmcd/gulp-svgo";
import svgo from "svgo";

import {plugins} from "../config/plugins.js";
import {filePaths} from "../config/paths.js";
import {logger} from "../config/logger.js";

const imagesvgo = (isBuild, serverInstance) => {
  return gulp
    .src(filePaths.src.svg)
    .pipe(logger.handleError("IMAGES SVG"))
    .pipe(plugins.newer(filePaths.build.images))
    .pipe(gulpSvgo(svgo))
    .pipe(gulp.dest(filePaths.build.images))
    .pipe(serverInstance.stream());
};

export {imagesvgo};
