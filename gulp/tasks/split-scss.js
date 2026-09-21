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

/**
 * Раздельная сборка SCSS-модулей в отдельные CSS-файлы.
 * Каждый .scss из src/scss/ (кроме config и module__base.scss) → отдельный .min.css в dist/css/modules/
 */
const splitScss = async (isBuild, serverInstance) => {
  // Собираем все SCSS файлы, исключая конфиги и объединённый файл
  return gulp
    .src([
      `${filePaths.srcFolder}/scss/config/*.scss`,
      `${filePaths.srcFolder}/scss/layout/*.scss`,
      `${filePaths.srcFolder}/scss/main/**/*.scss`,
      `${filePaths.srcFolder}/scss/module/**/*.scss`,
      `${filePaths.srcFolder}/scss/*.scss`,
    ], {ignore: [
      `**/config/**`,        // папка config (vars, default mixins и т.д.)
      `**/__*.*`,            // временные файлы типа __*.scss
      `**/module__base.scss`,// объединённый файл — он собирается отдельно
    ]})
    .pipe(logger.handleError("SCSS-split"))
    .pipe(plugins.if(!isBuild, sourcemaps.init())) // source-maps только в dev
    .pipe(
      sass({
        outputStyle: "expanded",
        silenceDeprecations: ["legacy-js-api"],
      }),
    )
    .pipe(postcss(getProcessors(isBuild)))
    .pipe(plugins.replace(/@img\//g, "../img/"))
    .pipe(reprefix()) // классовая уникальность: <basePrefix>__ → <prefix>__
    // Переименовываем: layout/header.scss → modules/header.min.css
    //                  module/catalog/product.scss → modules/product.min.css
    .pipe(rename({dirname: "modules"}))
    .pipe(rename({extname: ".min.css"}))
    .pipe(plugins.if(!isBuild, sourcemaps.write())) // инлайн-map, dev only
    .pipe(gulp.dest(filePaths.build.css))
    .pipe(serverInstance.stream());
};

export {splitScss};
