import gulp from "gulp";
import pug from "gulp-pug";
import htmlMinimizer from "gulp-html-minimizer";
import formatHtml from "gulp-format-html";
import imgToPicture from "gulp-html-img-to-picture";

import {filePaths} from "../config/paths.js";
import {plugins} from "../config/plugins.js";
import {logger} from "../config/logger.js";
import {reprefix} from "../config/project.js";

const html = (isBuild, serverInstance) => {
  return gulp
    .src(filePaths.src.html)
    .pipe(logger.handleError("HTML"))
    .pipe(pug())
    .pipe(reprefix()) // классовая уникальность: <basePrefix>__ → <prefix>__
    .pipe(
      imgToPicture({
        // src в разметке уже начинается с img/, поэтому корень — сам dist/
        imgFolder: `${filePaths.buildFolder}/`,
        pictureClassAttribute: "data-picture-class",
        logger: false,
        // Сортировка по размеру может поставить <img> раньше <source> (если jpg
        // вышел легче webp), и тогда браузер source игнорирует. Порядок фиксированный:
        // плагин добавляет source через unshift, так что avif окажется первым.
        sortBySize: false,
        filterUnexistedImages: true,
        sourceExtensions: [
          {extension: "webp", mimetype: "image/webp"},
          ...(isBuild ? [{extension: "avif", mimetype: "image/avif"}] : []),
        ],
      })
    )
    .pipe(plugins.if(isBuild, htmlMinimizer({
      quoteCharacter: '"',
      useShortDoctype: true,
      sortClassName: true,
      removeComments: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      sortAttributes: true,
    })))
    .pipe(plugins.if(!isBuild, formatHtml({
      indent_size: 2,
    })))
    .pipe(gulp.dest(filePaths.buildFolder))
    .pipe(serverInstance.stream());
};

export {html};
