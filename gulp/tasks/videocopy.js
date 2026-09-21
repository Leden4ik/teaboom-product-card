import gulp from "gulp";
import {Transform} from "node:stream";
import path from "node:path";
import os from "node:os";
import {writeFile, readFile, unlink, copyFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {createRequire} from "node:module";
import sharp from "sharp";

import {plugins} from "../config/plugins.js";
import {filePaths} from "../config/paths.js";
import {logger} from "../config/logger.js";

// ffmpeg-static is CJS — use createRequire for safe import in ESM context
const require = createRequire(import.meta.url);
const ffmpegBin = require("ffmpeg-static");

const exec = promisify(execFile);

const VIDEO_EXTS = new Set([".mp4", ".webm", ".ogg", ".ogv", ".mov", ".avi"]);

const ffmpegExec = (...args) => exec(ffmpegBin, args);

const createVideoTransform = (isBuild) =>
  new Transform({
    objectMode: true,
    async transform(file, enc, callback) {
      if (!file.isBuffer()) return callback(null, file);

      const ext = path.extname(file.path).toLowerCase();
      if (!VIDEO_EXTS.has(ext)) return callback(null, file);

      const tmpId = randomUUID();
      const tmpInput = path.join(os.tmpdir(), `gv-in-${tmpId}${ext}`);
      const tmpMp4 = path.join(os.tmpdir(), `gv-mp4-${tmpId}.mp4`);
      const tmpPoster = path.join(os.tmpdir(), `gv-poster-${tmpId}.jpg`);

      try {
        await writeFile(tmpInput, file.contents);

        // Extract poster frame (first frame)
        await ffmpegExec("-i", tmpInput, "-ss", "0", "-frames:v", "1", "-q:v", "2", "-y", tmpPoster);

        // Video output
        if (isBuild) {
          // H.264 + AAC, faststart for progressive web streaming
          await ffmpegExec(
            "-i", tmpInput,
            "-c:v", "libx264", "-crf", "23", "-preset", "medium",
            "-movflags", "+faststart", "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-y", tmpMp4
          );

          const videoFile = file.clone();
          videoFile.path = file.path.replace(/\.[^.]+$/, ".mp4");
          videoFile.contents = await readFile(tmpMp4);
          this.push(videoFile);
        } else {
          // Dev: copy original unchanged (fast)
          this.push(file.clone());
        }

        const posterJpgBuffer = await readFile(tmpPoster);

        // Poster JPG
        const posterJpgFile = file.clone();
        posterJpgFile.path = file.path.replace(/\.[^.]+$/, ".jpg");
        posterJpgFile.contents = posterJpgBuffer;
        this.push(posterJpgFile);

        // Poster WebP
        const posterWebpFile = file.clone();
        posterWebpFile.path = file.path.replace(/\.[^.]+$/, ".webp");
        posterWebpFile.contents = await sharp(posterJpgBuffer).webp({quality: 80}).toBuffer();
        this.push(posterWebpFile);

        callback();
      } catch (err) {
        callback(err);
      } finally {
        await Promise.all([
          unlink(tmpInput).catch(() => {}),
          unlink(tmpMp4).catch(() => {}),
          unlink(tmpPoster).catch(() => {}),
        ]);
      }
    },
  });

const videocopy = (isBuild, serverInstance) => {
  return gulp
    .src(filePaths.src.video)
    .pipe(logger.handleError("VIDEO"))
    .pipe(plugins.newer({dest: filePaths.build.images, ext: ".jpg"}))
    .pipe(createVideoTransform(isBuild))
    .pipe(gulp.dest(filePaths.build.images))
    .pipe(serverInstance.stream());
};

export {videocopy};
