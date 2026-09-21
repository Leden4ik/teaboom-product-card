import gulp from "gulp";
import svgSprite from "gulp-svg-sprite";

import {filePaths} from "../config/paths.js";
import {logger} from "../config/logger.js";

const createSvgSprite = () => {
  return gulp
    .src(`${filePaths.src.svgIcons}`, {})
    .pipe(logger.handleError("SVG SPRITE"))
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: `../icons/sprite.svg`,
            example: false,
          },
        },
      })
    )
    .pipe(gulp.dest(filePaths.build.images));
};

export {createSvgSprite};
