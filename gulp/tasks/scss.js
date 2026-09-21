import gulp from "gulp";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import rename from "gulp-rename";
import sourcemaps from "gulp-sourcemaps";

import postcss from "gulp-postcss";

import {filePaths} from "../config/paths.js";
import {plugins} from "../config/plugins.js";
import {logger} from "../config/logger.js";
import {reprefix} from "../config/project.js";
import {getProcessors} from "../config/postcss.js";

const sass = gulpSass(dartSass);

const scss = (isBuild, serverInstance) => {
  return gulp
    .src(filePaths.src.scss)
    .pipe(logger.handleError("SCSS"))
    .pipe(plugins.if(!isBuild, sourcemaps.init())) // source-maps только в dev
    .pipe(sass({outputStyle: "expanded", silenceDeprecations: ["legacy-js-api"]}, null))
    .pipe(postcss(getProcessors(isBuild)))
    .pipe(plugins.replace(/@img\//g, "../img/"))
    .pipe(reprefix()) // классовая уникальность: <basePrefix>__ → <prefix>__
    .pipe(rename({extname: ".min.css"}))
    .pipe(plugins.if(!isBuild, sourcemaps.write())) // инлайн-map, dev only
    .pipe(gulp.dest(filePaths.build.css))
    .pipe(serverInstance.stream());
};

export {scss};
