import gulp from "gulp";
import {Transform} from "node:stream";
import path from "node:path";
import sharp from "sharp";

import {plugins} from "../config/plugins.js";
import {filePaths} from "../config/paths.js";
import {logger} from "../config/logger.js";

const createSharpTransform = (isBuild) =>
  new Transform({
    objectMode: true,
    async transform(file, enc, callback) {
      if (!file.isBuffer()) return callback(null, file);

      const ext = path.extname(file.path).toLowerCase();
      const isJpeg = ext === ".jpg" || ext === ".jpeg";
      const isPng = ext === ".png";

      if (!isJpeg && !isPng) return callback(null, file);

      try {
        const src = sharp(file.contents);

        // 1. Optimised original
        const originalFile = file.clone();
        originalFile.contents = isJpeg
          ? await src.clone().jpeg({quality: 80, mozjpeg: true}).toBuffer()
          : await src.clone().png({quality: 80, compressionLevel: 8, palette: true}).toBuffer();
        this.push(originalFile);

        // 2. WebP (always)
        const webpFile = file.clone();
        webpFile.path = file.path.replace(/\.[^.]+$/, ".webp");
        webpFile.contents = await src.clone().webp({quality: 80}).toBuffer();
        this.push(webpFile);

        // 3. AVIF (build only — slow to encode)
        if (isBuild) {
          const avifFile = file.clone();
          avifFile.path = file.path.replace(/\.[^.]+$/, ".avif");
          avifFile.contents = await src.clone().avif({quality: 60, effort: 4}).toBuffer();
          this.push(avifFile);
        }

        callback();
      } catch (err) {
        callback(err);
      }
    },
  });

const images = (isBuild, serverInstance) => {
  return gulp
    .src(filePaths.src.images)
    .pipe(logger.handleError("IMAGES"))
    .pipe(plugins.newer({dest: filePaths.build.images, ext: ".webp"}))
    .pipe(createSharpTransform(isBuild))
    .pipe(gulp.dest(filePaths.build.images))
    .pipe(serverInstance.stream());
};

export {images};
